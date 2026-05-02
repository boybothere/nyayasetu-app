import { callGemini } from "../core/geminiClient";
import { readCaseFile, writeCaseFile } from "../core/caseStore";

export abstract class BaseAgent {
    abstract name: string;
    abstract systemPrompt: string;
    abstract outputFile: string;

    async run(caseId: string, inputFile: string): Promise<void> {
        console.log(`[${this.name}] Starting for case ${caseId}`);

        const input = readCaseFile(caseId, inputFile);
        if (!input) throw new Error(`Input file ${inputFile} not found for case ${caseId}`);

        const userMessage = `Here is the case data to analyse:\n\n${JSON.stringify(input, null, 2)}`;

        // Notice we are passing jsonMode = true to our upgraded Gemini client
        const rawOutput = await callGemini(this.systemPrompt, userMessage, true);

        let parsed;
        try {
            parsed = JSON.parse(rawOutput);
        } catch {
            throw new Error(`${this.name} returned invalid JSON: ${rawOutput.slice(0, 200)}`);
        }

        writeCaseFile(caseId, this.outputFile, {
            agent: this.name,
            timestamp: new Date().toISOString(),
            output: parsed
        });

        console.log(`[${this.name}] Done. Output written to ${this.outputFile}`);
    }
}