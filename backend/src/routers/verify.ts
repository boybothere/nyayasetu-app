import express from "express";
import { readCaseFile, writeCaseFile } from "../core/caseStore";

const router = express.Router();

// GET /api/verify/:caseId — get action plan for review
router.get("/:caseId", (req, res) => {
    const plan = readCaseFile(req.params.caseId, 'action_plan.json');
    if (!plan) return res.status(404).json({ error: 'Action plan not found' });
    res.json(plan);
});

// POST /api/verify/:caseId/item — approve/edit/reject one item
router.post("/:caseId/item", (req, res) => {
    const { caseId } = req.params;
    const { directive_id, decision, edited_data, reviewer_name } = req.body;
    // decision: 'approved' | 'edited' | 'rejected'

    let verified = readCaseFile<any>(caseId, 'verified.json') || { items: [], allApproved: false };

    // Remove existing decision for this directive if re-reviewing
    verified.items = verified.items.filter((i: any) => i.directive_id !== directive_id);

    verified.items.push({
        directive_id,
        decision,
        data: decision === 'edited' ? edited_data : null,
        reviewer: reviewer_name,
        timestamp: new Date().toISOString()
    });

    // Check if all items are reviewed
    const plan = readCaseFile<any>(caseId, 'action_plan.json');
    const totalItems = plan?.output?.action_items?.length || 0;
    const approvedOrEdited = verified.items.filter(
        (i: any) => i.decision === 'approved' || i.decision === 'edited'
    ).length;
    verified.allApproved = approvedOrEdited === totalItems;

    writeCaseFile(caseId, 'verified.json', verified);
    res.json({ success: true, allApproved: verified.allApproved });
});

export default router;