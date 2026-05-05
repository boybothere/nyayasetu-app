import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export async function callGemini(
    systemPrompt: string,
    userMessage: string,
    jsonMode: boolean = true
): Promise<string> {

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined,
    });

    const result = await model.generateContent(userMessage);
    return result.response.text();
}