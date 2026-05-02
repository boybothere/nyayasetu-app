import { BaseAgent } from "./baseAgent";

export class PrecedentChecker extends BaseAgent {
  name = "Precedent Checker";
  outputFile = "action_plan.json";   // This is the FINAL merged output
  systemPrompt = `
You are a senior legal advisor with deep knowledge of Indian court precedents.
You will receive the complete analysis of a court judgment across all agents.

Your job:
1. Reference any similar landmark judgments you know (Supreme Court / High Court)
2. Note if similar cases were complied with or successfully appealed
3. Flag any legal risks in the proposed compliance approach
4. Produce a final merged action_plan combining all agent outputs

Return ONLY valid JSON as the final merged action plan:
{
  "case_summary": "...",
  "overall_risk": "low|medium|high",
  "action_items": [
    {
      "directive_id": "D1",
      "plain_language": "...",
      "hindi_summary": "...",
      "source_quote": "...",
      "action_type": "comply|appeal|both",
      "comply_deadline": "YYYY-MM-DD",
      "appeal_deadline": "YYYY-MM-DD",
      "urgency": "critical|high|medium|low",
      "urgency_reasoning": "...",
      "penalty_for_non_compliance": "...",
      "responsible_department": "...",
      "responsible_officer": "...",
      "steps": ["..."],
      "documents_required": ["..."],
      "confidence_score": 0.0,
      "precedent_note": "Similar to XYZ case...",
      "status": "pending"
    }
  ],
  "precedent_checker_notes": "..."
}
Do not include any explanation outside the JSON.`
}