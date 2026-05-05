import express from "express";
import { LegalAnalyst } from "../agents/legalAnalyst";
import { CompliancePlanner } from "../agents/compliancePlanner";
import { ImplementationOfficer } from "../agents/implementationOfficer";
import { PrecedentChecker } from "../agents/precedentChecker";
import { readCaseFile, writeCaseFile } from "../core/caseStore";

const router = express.Router();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// POST /api/agents/run/:caseId
router.post("/run/:caseId", async (req, res) => {
    const { caseId } = req.params;

    const extracted = readCaseFile(caseId, 'extracted.json');
    if (!extracted) {
        return res.status(404).json({ error: 'Case not found or not extracted yet' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (event: string, data: object) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
        send('agent_start', { agent: 'Legal Analyst' });
        await new LegalAnalyst().run(caseId, 'extracted.json');
        send('agent_done', { agent: 'Legal Analyst' });

        await delay(3000);

        send('agent_start', { agent: 'Compliance Planner' });
        await new CompliancePlanner().run(caseId, 'legal_analysis.json');
        send('agent_done', { agent: 'Compliance Planner' });

        await delay(3000);

        send('agent_start', { agent: 'Implementation Officer' });
        await new ImplementationOfficer().run(caseId, 'compliance_plan.json');
        send('agent_done', { agent: 'Implementation Officer' });

        await delay(3000);

        send('agent_start', { agent: 'Precedent Checker' });

        const allData = {
            extracted: readCaseFile(caseId, 'extracted.json'),
            analysis: readCaseFile(caseId, 'legal_analysis.json'),
            compliance: readCaseFile(caseId, 'compliance_plan.json'),
            implementation: readCaseFile(caseId, 'implementation_plan.json')
        };

        writeCaseFile(caseId, 'all_agent_data.json', allData);
        await new PrecedentChecker().run(caseId, 'all_agent_data.json');
        send('agent_done', { agent: 'Precedent Checker' });

        send('all_done', { caseId, redirect: `/cases/${caseId}/verify` });
        res.end();

    } catch (err: any) {
        console.error("!!! AGENT PIPELINE CRASHED:", err);
        send('error', { message: err.message });
        res.end();
    }
});

export default router;