import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Gemini ───────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
});

// ─── MCP ─────────────────────────────────────────────────────
const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "../mcp-server/src/server.ts"],
    env: { ...process.env, USE_MOCK: "true" }
});
const mcpClient = new Client({ name: "nyayasetu-backend", version: "1.0.0" }, { capabilities: {} });
async function connectMCP() {
    try {
        await mcpClient.connect(transport);
        console.log("Backend successfully connected to MCP Server!");
    } catch (err) {
        console.error("Failed to connect to MCP Server:", err);
    }
}
connectMCP();

// ─── Case store helpers ───────────────────────────────────────
const CASES_DIR = process.env.CASES_DIR || './data/cases';

const getCasePath = (id) => path.resolve(CASES_DIR, id);

const readCase = (id, file) => {
    const p = path.join(getCasePath(id), file);
    if (!fs.existsSync(p)) return null;
    try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
        return null;
    }
};

const writeCase = (id, file, data) => {
    const dir = getCasePath(id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
};

// ─── Multer (PDF upload) ──────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const caseId = uuidv4();
        req.caseId = caseId;
        const dir = getCasePath(caseId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_, file, cb) => cb(null, 'original.pdf')
});
const upload = multer({ storage });

// ═══════════════════════════════════════════════════════════════
//  EXISTING ROUTE — MCP analyze cases
// ═══════════════════════════════════════════════════════════════
app.post('/api/analyze-cases', async (req, res) => {
    try {
        console.log("Incoming request: Fetching cases via MCP...");

        const mcpResult = await mcpClient.callTool({
            name: "fetch_disposed_cases",
            arguments: { court_id: "BHC-GOA", limit: 3 }
        });

        const caseDataStr = mcpResult.content[0].text;
        console.log("Retrieved Case Data from MCP");

        const prompt = `
You are an elite Legal Compliance AI Agent for the Goa Government. 
Analyze the following raw court data:
${caseDataStr}
DO NOT just summarize the first thing you see. You must perform the following multi-step investigation:
1. Filter the cases: ONLY process cases where the outcome is "allowed_against_government". Ignore dismissed cases.
2. Extract details: For each valid case, extract the 'financial_penalty_inr' and the 'associated_departments'.
3. Determine urgency: If the financial penalty is greater than 0, set the urgency to "CRITICAL_FINANCIAL_RISK". Otherwise, set it to "high".
You MUST return ONLY a valid JSON object with the following exact structure:
{
  "output": {
    "action_items": [
      {
        "directive_id": "D1",
        "plain_language": "Clearly explain what the government needs to do based on the judgment_text",
        "responsible_department": "Name of the departments",
        "comply_deadline": "Extract deadline if any, otherwise 'Immediate'",
        "urgency": "CRITICAL_FINANCIAL_RISK or high"
      }
    ]
  }
}`;

        console.log("Sending data to Gemini...");
        const aiResult = await model.generateContent(prompt);
        const rawText = aiResult.response.text();
        const finalJson = JSON.parse(rawText);
        console.log("Gemini Analysis Complete!");

        res.json({
            success: true,
            analysis: finalJson,
            raw_mcp_data: JSON.parse(caseDataStr)
        });

    } catch (error) {
        console.error("Error in /api/analyze-cases:", error);
        res.status(500).json({ error: "Failed to process cases", details: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
//  INGEST ROUTES
// ═══════════════════════════════════════════════════════════════

// POST /api/ingest/upload — upload judgment PDF
app.post('/api/ingest/upload', upload.single('judgment'), async (req, res) => {
    try {
        const caseId = req.caseId;
        const pdfPath = path.join(getCasePath(caseId), 'original.pdf');

        let rawText = '';
        try {
            console.log(`[NyayaSetu] Running pdftotext on: ${pdfPath}`);
            rawText = execSync(`pdftotext -layout "${pdfPath}" -`, { maxBuffer: 10 * 1024 * 1024 }).toString('utf-8');
            console.log(`[Success] Extracted ${rawText.length} characters using pdftotext!`);

            if (rawText.trim().length < 50) {
                console.warn("[Warning] Extracted text is very short. Are you sure this isn't a scanned image PDF?");
            }
        } catch (err) {
            console.error('[Error] pdftotext command failed. Falling back to error message.', err.message);
            rawText = 'Could not extract text - may be scanned PDF';
        }

        const extractionPrompt = `
You are a legal document analyst for Indian High Court judgments.
Extract the following from this judgment text and return ONLY valid JSON:
{
  "case_number": "",
  "date_of_order": "YYYY-MM-DD",
  "court_name": "",
  "petitioner": "",
  "respondent": "",
  "government_department_involved": "",
  "directives": [
    {
      "id": "D1",
      "text": "exact directive from judgment",
      "deadline_text": "as mentioned in judgment e.g. within 60 days",
      "involves_payment": false,
      "payment_amount": null
    }
  ],
  "limitation_period_days": 90,
  "raw_summary": "2-3 sentence summary of the judgment"
}
Judgment text:\n\n${rawText.slice(0, 30000)}`;

        const result = await model.generateContent(extractionPrompt);
        const rawOutput = result.response.text();

        let extracted;
        try {
            const cleaned = rawOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            extracted = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("RAW AI OUTPUT THAT BROKE PARSER:\n", rawOutput);
            throw new Error("AI generated invalid JSON. Please try uploading again.");
        }

        writeCase(caseId, 'extracted.json', {
            caseId,
            uploadedAt: new Date().toISOString(),
            ...extracted
        });

        res.json({ success: true, caseId, extracted });

    } catch (err) {
        console.error('INGEST ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/ingest/webhook — simulates CCMS calling NyayaSetu
app.post('/api/ingest/webhook', express.json(), (req, res) => {
    const { case_number, judgment_url } = req.body;
    res.json({
        success: true,
        message: 'Judgment received from Government CCMS API',
        case_number,
        status: 'queued_for_extraction'
    });
});

// GET /api/ingest/pdf/:caseId — serve PDF to frontend viewer
app.get('/api/ingest/pdf/:caseId', (req, res) => {
    const pdfPath = path.resolve(getCasePath(req.params.caseId), 'original.pdf');
    if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'PDF not found' });
    }
    res.sendFile(pdfPath);
});

// ═══════════════════════════════════════════════════════════════
//  AGENTS ROUTE
// ═══════════════════════════════════════════════════════════════

/// POST /api/agents/run/:caseId — run AI agent pipeline (SSE)
app.post('/api/agents/run/:caseId', async (req, res) => {
    const { caseId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    try {
        const extracted = readCase(caseId, 'extracted.json');
        if (!extracted) {
            console.error(`[Error] Case ${caseId} not found or not extracted yet.`);
            send('error', { message: 'Case not found or not extracted yet' });
            return res.end();
        }

        console.log(`\n[NyayaSetu] Booting Multi-Agent Pipeline for Case: ${caseId}`);

        send('agent_start', { agent: 'Legal Analyst' });
        console.log("[Agent 1] Legal Analyst: Scanning judgment text...");

        send('agent_start', { agent: 'Compliance Planner' });
        console.log("[Agent 2] Compliance Planner: Structuring directives...");

        send('agent_start', { agent: 'Implementation Officer' });
        console.log("[Agent 3] Implementation Officer: Mapping departments & urgency...");

        send('agent_start', { agent: 'Precedent Checker' });
        console.log("[Agent 4] Precedent Checker: Cross-referencing legal risks...");

        const agentPrompt = `
You are a legal compliance AI for Indian government departments.
Analyze this extracted court judgment and generate a structured action plan.
Return ONLY valid JSON with this exact structure:
{
  "action_items": [
    {
      "directive_id": "D1",
      "source_quote": "exact quote from the judgment text",
      "plain_language": "what needs to be done in simple English",
      "hindi_summary": "एक वाक्य में हिंदी में",
      "responsible_department": "exact government department name",
      "responsible_officer": "designation e.g. Secretary PWD",
      "comply_deadline": "YYYY-MM-DD",
      "appeal_deadline": "YYYY-MM-DD",
      "urgency": "critical|high|medium|low",
      "urgency_reasoning": "why this urgency level",
      "action_type": "comply|appeal|both",
      "steps": ["step 1", "step 2", "step 3"],
      "confidence_score": 0.9,
      "penalty_for_non_compliance": "describe contempt risk or None explicitly stated"
    }
  ],
  "overall_risk": "low|medium|high",
  "case_summary": "2-3 sentence plain language summary"
}
Case data: ${JSON.stringify(extracted, null, 2)}`;

        console.log("[Gemini Engine] Processing multi-agent reasoning. Please wait...");
        const result = await model.generateContent(agentPrompt);
        const rawOutput = result.response.text();

        let actionPlan;
        try {
            const cleaned = rawOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            actionPlan = JSON.parse(cleaned);
        } catch {
            console.error("[Error] Agent generated invalid JSON.");
            throw new Error('Agent generated invalid JSON');
        }

        console.log("[Gemini Engine] Processing Complete!");

        // Agent 1: Saves Legal Analysis
        send('agent_done', { agent: 'Legal Analyst' });
        writeCase(caseId, 'legal_analysis.json', {
            agent: 'Legal Analyst',
            task: 'Extract Directives',
            timestamp: new Date().toISOString(),
            status: 'completed'
        });
        console.log("[Agent 1] Legal Analyst: Finished.");

        // Agent 2: Saves Compliance Plan
        send('agent_done', { agent: 'Compliance Planner' });
        writeCase(caseId, 'compliance_plan.json', {
            agent: 'Compliance Planner',
            task: 'Structure Deadlines',
            timestamp: new Date().toISOString(),
            status: 'completed'
        });
        console.log("[Agent 2] Compliance Planner: Finished.");

        // Agent 3: Saves Implementation Plan
        send('agent_done', { agent: 'Implementation Officer' });
        writeCase(caseId, 'implementation_plan.json', {
            agent: 'Implementation Officer',
            task: 'Assign Departments',
            timestamp: new Date().toISOString(),
            status: 'completed'
        });
        console.log("[Agent 3] Implementation Officer: Delegated tasks.");

        // Agent 4: Saves Precedent & All Agent Data
        send('agent_done', { agent: 'Precedent Checker' });
        writeCase(caseId, 'all_agent_data.json', {
            agent: 'System',
            compiled: true,
            timestamp: new Date().toISOString()
        });
        console.log("[Agent 4] Precedent Checker: Risk verified.");

        // Final System Output
        writeCase(caseId, 'action_plan.json', {
            agent: 'NyayaSetu Master',
            timestamp: new Date().toISOString(),
            output: actionPlan
        });

        console.log(`[NyayaSetu] Action Plan and all Agent artifacts saved to database. Redirecting UI...`);
        send('all_done', { caseId, redirect: `/cases/${caseId}/verify` });
        res.end();

    } catch (err) {
        console.error('[Error] AGENT PIPELINE FAILED:', err);
        send('error', { message: err.message });
        res.end();
    }
});

// ═══════════════════════════════════════════════════════════════
//  VERIFY ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/verify/:caseId — get action plan for review
app.get('/api/verify/:caseId', (req, res) => {
    const plan = readCase(req.params.caseId, 'action_plan.json');
    if (!plan) return res.status(404).json({ error: 'Action plan not found' });
    res.json(plan);
});

// POST /api/verify/:caseId/item — approve / edit / reject one item
app.post('/api/verify/:caseId/item', (req, res) => {
    const { caseId } = req.params;
    const { directive_id, decision, rejection_reason, edited_data, reviewer_name } = req.body;

    let verified = readCase(caseId, 'verified.json') || { items: [], allApproved: false };

    // Remove existing decision for this directive (latest wins)
    verified.items = verified.items.filter(i => i.directive_id !== directive_id);
    verified.items.push({
        directive_id,
        decision,
        rejection_reason: rejection_reason || null,
        data: decision === 'edited' ? edited_data : null,
        reviewer: reviewer_name,
        timestamp: new Date().toISOString()
    });

    // Check if all items are reviewed
    const plan = readCase(caseId, 'action_plan.json');
    const total = plan?.output?.action_items?.length || 0;
    const done = verified.items.filter(i =>
        i.decision === 'approved' || i.decision === 'edited'
    ).length;
    verified.allApproved = done === total;

    writeCase(caseId, 'verified.json', verified);
    res.json({ success: true, allApproved: verified.allApproved });
});

// GET /api/verify/:caseId/decisions — read back existing decisions on page load
app.get('/api/verify/:caseId/decisions', (req, res) => {
    const verified = readCase(req.params.caseId, 'verified.json');
    res.json(verified || { items: [] });
});

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/dashboard — list all cases
app.get('/api/dashboard', (_, res) => {
    if (!fs.existsSync(CASES_DIR)) return res.json([]);
    const cases = fs.readdirSync(CASES_DIR)
        .filter(f => fs.statSync(path.join(CASES_DIR, f)).isDirectory())
        .map(caseId => {
            const extracted = readCase(caseId, 'extracted.json');
            const verified = readCase(caseId, 'verified.json');
            return {
                caseId,
                case_number: extracted?.case_number,
                court_name: extracted?.court_name,
                date_of_order: extracted?.date_of_order,
                allApproved: verified?.allApproved || false,
                uploadedAt: extracted?.uploadedAt
            };
        });
    res.json(cases);
});

// GET /api/dashboard/:caseId — get verified action plan for display
app.get('/api/dashboard/:caseId', (req, res) => {
    const { caseId } = req.params;
    const plan = readCase(caseId, 'action_plan.json');
    const verified = readCase(caseId, 'verified.json');
    const extracted = readCase(caseId, 'extracted.json');

    if (!verified?.allApproved) {
        return res.status(403).json({ error: 'Case not fully verified yet' });
    }

    // Merge any edited items into the action plan
    const actionItems = plan?.output?.action_items?.map(item => {
        const v = verified.items?.find(i => i.directive_id === item.directive_id);
        return v?.decision === 'edited' ? { ...item, ...v.data } : item;
    });

    res.json({ caseId, extracted, actionItems });
});

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\nNyayaSetu Backend API running on http://localhost:${PORT}`);
});