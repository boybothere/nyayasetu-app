import fs from "fs";
import path from "path";

const CASES_DIR = process.env.CASES_DIR || './data/cases';

export function getCasePath(caseId: string): string {
    return path.join(CASES_DIR, caseId);
}

export function readCaseFile<T>(caseId: string, filename: string): T | null {
    const filePath = path.join(getCasePath(caseId), filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export function writeCaseFile(caseId: string, filename: string, data: unknown): void {
    const dir = getCasePath(caseId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function listCases(): string[] {
    if (!fs.existsSync(CASES_DIR)) return [];
    return fs.readdirSync(CASES_DIR).filter(f =>
        fs.statSync(path.join(CASES_DIR, f)).isDirectory()
    );
}