import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export function extractTextFromPDF(pdfPath: string): string {
    try {
        const text = execSync(
            `pdftotext -layout "${pdfPath}" -`,
            { maxBuffer: 10 * 1024 * 1024 }
        ).toString('utf-8');

        if (text.trim().length > 100) {
            console.log('PDF extracted digitally, length:', text.length);
            return text;
        }


        console.log('Falling back to OCR...');
        return extractWithOCR(pdfPath);

    } catch (err) {
        console.error('PDF extraction failed:', err);
        throw new Error('Could not extract text from PDF');
    }
}

function extractWithOCR(pdfPath: string): string {
    const tmpDir = '/tmp/nyaya_ocr_' + Date.now();
    fs.mkdirSync(tmpDir, { recursive: true });

    execSync(`pdftoppm -r 300 "${pdfPath}" ${tmpDir}/page`);


    const pages = fs.readdirSync(tmpDir).sort();
    let fullText = '';
    for (const page of pages) {
        const pageText = execSync(
            `tesseract ${tmpDir}/${page} stdout --psm 6 -l eng`,
            { maxBuffer: 5 * 1024 * 1024 }
        ).toString('utf-8');
        fullText += pageText + '\n\n';
    }

    fs.rmSync(tmpDir, { recursive: true });
    return fullText;
}