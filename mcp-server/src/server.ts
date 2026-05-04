import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// CONFIG & MOCK TOGGLE
// ==========================================
const USE_MOCK = process.env.USE_MOCK !== 'false'; // Defaults to true
const KANOON_API_KEY = process.env.KANOON_API_KEY;

// Placeholder for Kanoon SDK (you will import this when you get the key)
let kanoon: any = null;
if (!USE_MOCK && KANOON_API_KEY) {
    // import { Kanoon } from "kanoon";
    // kanoon = new Kanoon({ apiKey: KANOON_API_KEY });
    console.error("Live mode requires kanoon SDK to be installed and uncommented.");
}

// Storage paths for NyayaSetu
const STORAGE_DIR = path.join(process.cwd(), 'data', 'cases');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const server = new McpServer({
    name: "nyayasetu-kanoon-mcp",
    version: "1.0.0",
});

// ==========================================
// TOOL 1: fetch_disposed_cases
// ==========================================
server.tool(
    "fetch_disposed_cases",
    "Find recently disposed cases where the government is the respondent.",
    { court_id: z.string(), limit: z.number().optional().default(5) },
    async ({ court_id, limit }) => {
        if (USE_MOCK) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify([
                        {
                            id: "bhc-goa-wp-1042-2025",
                            case_number: "WP/1042/2025",
                            outcome: "allowed",
                            outcome_reason: "The State Government is directed to clear all pending provident fund and retirement dues for Kadamba Transport Corporation employees within 30 days.",
                            respondent: "State of Goa & Kadamba Transport Corporation"
                        },
                        {
                            id: "bhc-goa-pil-45-2024",
                            case_number: "PIL/45/2024",
                            outcome: "allowed",
                            outcome_reason: "The court finds severe Coastal Regulation Zone (CRZ) violations. The Goa Coastal Zone Management Authority (GCZMA) and North Goa District Collector are ordered to demolish the illegal structures at Morjim beach and submit a compliance report within 15 days.",
                            respondent: "GCZMA & State Government"
                        },
                        {
                            id: "bhc-goa-wp-2099-2025",
                            case_number: "WP/2099/2025",
                            outcome: "dismissed",
                            outcome_reason: "The petition filed by the private contractor is devoid of merit. The Public Works Department's (PWD) decision to terminate the highway tender was lawful and is upheld.",
                            respondent: "Public Works Department, Goa"
                        }
                    ], null, 2)
                }]
            };
        }

        // LIVE MODE (Kanoon API)
        const result = await kanoon.search.cases(
            `court_id:"${court_id}" party_composition.respondent:government`,
            { limit, order: "desc" }
        );

        const enriched = await Promise.all(
            result.data.map(async (c: any) => {
                const insights = await kanoon.courts.cases.insights.list(court_id, c.id);
                const outcome = insights.data?.find((i: any) => i.type === "outcome");
                return {
                    id: c.id,
                    case_number: c.case_number || c.id,
                    outcome: outcome?.data?.outcome?.type || "unknown",
                    outcome_reason: outcome?.data?.outcome?.reason || null,
                };
            })
        );

        return { content: [{ type: "text", text: JSON.stringify(enriched, null, 2) }] };
    }
);

// ==========================================
// TOOL 2: fetch_judgment_pdf
// ==========================================
server.tool(
    "fetch_judgment_pdf",
    "Download PDF and extract Kanoon insights (notes, outcome) for analysis.",
    { court_id: z.string(), case_id: z.string() },
    async ({ court_id, case_id }) => {
        const nyayaCaseId = uuidv4();
        const caseDir = path.join(STORAGE_DIR, nyayaCaseId);
        fs.mkdirSync(caseDir, { recursive: true });

        let extractedData: any = {
            caseId: nyayaCaseId,
            source_case_id: case_id,
            court_id,
            status: "pdf_downloaded_awaiting_extraction",
            uploadedAt: new Date().toISOString()
        };

        if (USE_MOCK) {
            // Mock PDF copy
            const demoPdfPath = path.join(process.cwd(), 'public', 'demo.pdf');
            if (fs.existsSync(demoPdfPath)) {
                fs.copyFileSync(demoPdfPath, path.join(caseDir, 'document.pdf'));
            }
            extractedData.outcome = "allowed";
            extractedData.order_notes = ["The Writ Petition is allowed.", "No order as to costs."];
        } else {
            // LIVE MODE
            const [caseDetails, insights, orders] = await Promise.all([
                kanoon.courts.cases.retrieve(court_id, case_id),
                kanoon.courts.cases.insights.list(court_id, case_id),
                kanoon.courts.cases.orders.list(court_id, case_id)
            ]);

            const latestOrder = orders.data?.find((o: any) => o.url);
            if (latestOrder) {
                // Here you would implement standard fetch to download the PDF to caseDir/document.pdf
                // await downloadFile(latestOrder.url, path.join(caseDir, 'document.pdf'));
            }

            const outcomeInsight = insights.data?.find((i: any) => i.type === "outcome");

            extractedData = {
                ...extractedData,
                petitioners: caseDetails.petitioners,
                respondents: caseDetails.respondents,
                order_date: latestOrder?.created_at,
                order_notes: latestOrder?.notes || [],
                outcome: outcomeInsight?.data?.outcome?.type || null,
                outcome_reason: outcomeInsight?.data?.outcome?.reason || null,
            };
        }

        fs.writeFileSync(path.join(caseDir, 'extracted.json'), JSON.stringify(extractedData, null, 2));

        return {
            content: [{
                type: "text",
                text: `Successfully fetched PDF and insights. Case initialized internally as NyayaSetu ID: ${nyayaCaseId}`
            }]
        };
    }
);

// ==========================================
// TOOL 3: update_compliance_status
// ==========================================
server.tool(
    "update_compliance_status",
    "Update the CCMS system with verified directives and deadlines.",
    { nyaya_case_id: z.string(), status: z.string(), action_items: z.array(z.any()) },
    async ({ nyaya_case_id, status, action_items }) => {
        const filePath = path.join(STORAGE_DIR, nyaya_case_id, 'verified.json');

        const payload = {
            nyaya_case_id,
            status,
            action_items,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

        return {
            content: [{
                type: "text",
                text: `Successfully synced ${action_items.length} directives to NyayaSetu case ${nyaya_case_id}.`
            }]
        };
    }
);

// ==========================================
// TOOL 4: get_case_summary
// ==========================================
server.tool(
    "get_case_summary",
    "Retrieve the current processing state and details of a NyayaSetu case.",
    { nyaya_case_id: z.string() },
    async ({ nyaya_case_id }) => {
        const caseDir = path.join(STORAGE_DIR, nyaya_case_id);
        if (!fs.existsSync(caseDir)) {
            return { content: [{ type: "text", text: "Case not found." }] };
        }

        let summary: any = { id: nyaya_case_id };
        const extPath = path.join(caseDir, 'extracted.json');
        const verPath = path.join(caseDir, 'verified.json');

        if (fs.existsSync(extPath)) summary = { ...summary, ...JSON.parse(fs.readFileSync(extPath, 'utf8')) };
        if (fs.existsSync(verPath)) summary = { ...summary, verification: JSON.parse(fs.readFileSync(verPath, 'utf8')) };

        return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
);

// ==========================================
// TOOL 5: get_case_events
// ==========================================
server.tool(
    "get_case_events",
    "Get hearing history and upcoming dates for a case (useful post-appeal).",
    { court_id: z.string(), case_id: z.string() },
    async ({ court_id, case_id }) => {
        if (USE_MOCK) {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        case_id,
                        total_events: 1,
                        events: [{ judge: "Amit Borkar", scheduled_at: "2026-04-23" }]
                    }, null, 2)
                }]
            };
        }

        // LIVE MODE
        const events = await kanoon.courts.cases.events.list(court_id, case_id, { order: "desc", limit: 10 });
        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    case_id,
                    total_events: events.data?.length,
                    events: events.data?.map((e: any) => ({
                        judge: e.judge,
                        scheduled_at: e.scheduled_at,
                        heard_at: e.heard_at,
                    }))
                }, null, 2)
            }]
        };
    }
);

// ==========================================
// START SERVER
// ==========================================
async function main() {
    console.log(`Starting NyayaSetu MCP Server (MOCK MODE: ${USE_MOCK})`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);