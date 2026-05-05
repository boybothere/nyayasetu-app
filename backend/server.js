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
}
`;

        console.log("Sending data to Gemini...");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });

        const aiResult = await model.generateContent(prompt);
        const rawText = aiResult.response.text();

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