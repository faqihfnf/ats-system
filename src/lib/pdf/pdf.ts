import { createRequire } from "module";
const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");

/**
 * Extract text dari PDF yang di-fetch dari URL.
 */
export async function extractTextFromPDF(cvUrl: string): Promise<string> {
  try {
    console.log("[PDF] Fetching PDF from URL...");
    const response = await fetch(cvUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[PDF] Extracting text from PDF...");

    const text = await new Promise<string>((resolve, reject) => {
      const parser = new (PDFParser as any)(null, 1);

      parser.on("pdfParser_dataReady", (pdfData: any) => {
        let fullText = "";
        for (const page of pdfData.Pages) {
          for (const text of page.Texts) {
            // Decode URI-encoded text from pdf2json
            const decoded = text.R.map((r: any) => {
              try {
                return decodeURIComponent(r.T);
              } catch {
                return r.T;
              }
            }).join(" ");
            fullText += decoded + " ";
          }
          fullText += "\n";
        }
        resolve(fullText.trim());
      });

      parser.on("pdfParser_dataError", (err: any) => {
        reject(new Error(err?.parserError || "PDF parsing failed"));
      });

      parser.parseBuffer(buffer);
    });

    if (!text || text.length < 50) {
      throw new Error(
        "PDF tidak berisi teks yang bisa diekstrak. Pastikan CV bukan scan/gambar.",
      );
    }

    console.log(`[PDF] Extracted ${text.length} characters from PDF`);
    return text;
  } catch (error: any) {
    console.error("[PDF] Failed to extract text:", error.message);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}
