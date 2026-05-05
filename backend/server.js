import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "../mcp-server/src/server.ts"],
    env: {
        ...process.env,
        USE_MOCK: "true" // prototype demo
    }
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

app.post('/api/analyze-cases', async (req, res) => {
    try {
        console.log("Incoming request: Fetching cases via MCP...");

        // Call the MCP Tool
        const mcpResult = await mcpClient.callTool({
            name: "fetch_disposed_cases",
            arguments: { court_id: "BHC-GOA", limit: 3 }
        });

        const caseDataStr = mcpResult.content[0].text;
        console.log("Retrieved Case Data from MCP");

        // Formulate the strict prompt for Gemini
        const prompt = `
            You are an elite Government Legal Compliance AI. 
            Review the following court cases retrieved via our MCP database tool.
            
            COURT CASES JSON:
            ${caseDataStr}
            
            INSTRUCTIONS:
            1. ONLY look at cases where the "outcome" is "allowed" (meaning the government lost and must take action). Ignore "dismissed" cases entirely.
            2. For the "allowed" cases, extract the actionable directives for the government.
            3. You MUST output your response as a valid JSON object matching the exact schema below. Do not include markdown formatting or backticks outside of the JSON.

            EXPECTED JSON SCHEMA:
            {
                "output": {
                    "action_items": [
                        {
                            "directive_id": "D1",
                            "source_quote": "[Extract the exact sentence from the outcome_reason]",
                            "plain_language": "[Translate the legal action into plain English]",
                            "responsible_department": "[Infer the specific Goa government department, e.g., 'Labour Department', 'GCZMA']",
                            "comply_deadline": "[Extract the deadline in YYYY-MM-DD format based on today's date, or 'Immediate']",
                            "urgency": "[high, medium, or low]"
                        }
                    ]
                }
            }
        `;

        console.log("Sending data to Gemini...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const aiResult = await model.generateContent(prompt);
        let rawText = aiResult.response.text();

        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const finalJson = JSON.parse(rawText);
        console.log("Gemini Analysis Complete!");

        // Send to Frontend
        res.json({
            success: true,
            analysis: finalJson,
            raw_mcp_data: JSON.parse(caseDataStr) // Sending the raw data just in case the frontend wants to show it
        });

    } catch (error) {
        console.error("Error in /api/analyze-cases:", error);
        res.status(500).json({ error: "Failed to process cases", details: error.message });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\nNyayaSetu Backend API running on http://localhost:${PORT}`);
});