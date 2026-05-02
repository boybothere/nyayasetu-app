import express from "express";
import { readCaseFile, listCases } from "../core/caseStore";

const router = express.Router();

// GET /api/dashboard — list all cases with verified status
router.get("/", (_, res) => {
    const cases = listCases().map(caseId => {
        const extracted = readCaseFile<any>(caseId, 'extracted.json');
        const verified = readCaseFile<any>(caseId, 'verified.json');

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
router.get("/:caseId", (req, res) => {
    const { caseId } = req.params;

    const plan = readCaseFile<any>(caseId, 'action_plan.json');
    const verified = readCaseFile<any>(caseId, 'verified.json');
    const extracted = readCaseFile<any>(caseId, 'extracted.json');

    // BULLETPROOF FIX: Return a "pending" status instead of crashing with a 403
    if (!verified?.allApproved) {
        return res.json({ status: 'pending_verification', caseId, extracted });
    }

    const actionItems = plan?.output?.action_items?.map((item: any) => {
        const verifiedItem = verified.items.find((v: any) => v.directive_id === item.directive_id);
        return verifiedItem?.decision === 'edited' ? { ...item, ...verifiedItem.data } : item;
    });

    res.json({ status: 'verified', caseId, extracted, actionItems });
});
export default router;