import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { extractTextFromPDF } from "../core/pdfParser";
import { writeCaseFile, getCasePath } from "../core/caseStore";
import { callGemini } from "../core/geminiClient";
import fs from "fs";

const router = express.Router();

// Setup multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const caseId = uuidv4();
        (req as any).caseId = caseId;
        const dir = getCasePath(caseId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_, file, cb) => cb(null, 'original.pdf')
});
const upload = multer({ storage });

// POST /api/ingest/webhook — simulates CCMS calling NyayaSetu
router.post("/webhook", express.json(), async (req, res) => {
    // CCMS would send: { case_number, court, judgment_url }
    const { case_number, judgment_url } = req.body;

    // For demo: Just acknowledge receipt
    res.json({
        success: true,
        message: 'Judgment received from Government CCMS API',
        case_number,
        status: 'queued_for_extraction'
    });
});

// POST /api/ingest/upload
router.post("/upload", upload.single("judgment"), async (req, res) => {
    try {
        const caseId = (req as any).caseId;
        const pdfPath = path.join(getCasePath(caseId), 'original.pdf');

        // Step 1: Extract raw text
        const rawText = extractTextFromPDF(pdfPath);

        // Step 2: Use Gemini to extract structured data
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
Judgment text:\n\n${rawText}`;
        // (Truncate to 30k chars to stay within token limits)

        // THE BULLETPROOF PARSER
        const rawOutput = await callGemini('', extractionPrompt, true);

        let extracted;
        try {
            // Vacuum up any accidental markdown blocks the AI added
            const cleanedOutput = rawOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            extracted = JSON.parse(cleanedOutput);
        } catch (parseError) {
            console.error("!!! RAW AI OUTPUT THAT BROKE THE PARSER:\n", rawOutput);
            throw new Error("The AI generated invalid JSON (likely an unescaped quote). Please click 'Upload & Analyse' to try again.");
        }

        // Save extracted data
        writeCaseFile(caseId, 'extracted.json', {
            caseId,
            uploadedAt: new Date().toISOString(),
            ...extracted
        });

        res.json({ success: true, caseId, extracted });

    } catch (err: any) {
        console.error("INGEST ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// Added this snippet here as recommended by the guide for the frontend PDF viewer
router.get('/pdf/:caseId', (req, res) => {
    res.sendFile(path.resolve(getCasePath(req.params.caseId), 'original.pdf'));
});

export default router;