import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type CVAnalysisResult = {
  strengths: string;
  weaknesses: string;
  conclusion: string;
  recommendation: "RECOMMENDED" | "SUGGESTED" | "NOT_RECOMMENDED";
  matchPercentage: number;
};

/**
 * Fungsi Helper untuk menangani Retry dengan Exponential Backoff.
 * Berguna untuk mengatasi error 503 (Service Unavailable) atau 429 (Rate Limit).
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000,
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Deteksi error yang layak dicoba kembali
      const errorMessage = error.message?.toLowerCase() || "";
      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("service unavailable") ||
        errorMessage.includes("too many requests");

      if (isRetryable && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i); // Jeda: 2s, 4s, 8s
        console.warn(
          `[Gemini] Server sibuk/limit. Mencoba kembali dalam ${delay}ms... (Percobaan ${i + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function analyzeCVWithGemini(
  cvUrl: string,
  jobDescription: string,
  jobQualifications: string,
  jobTitle: string,
): Promise<CVAnalysisResult> {
  try {
    console.log("=== GEMINI ANALYSIS START ===");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Gunakan Konfigurasi JSON Mode agar output selalu valid JSON
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    console.log("Fetching PDF from URL...");
    const response = await fetch(cvUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Kamu adalah seorang rekruter profesional. Analisis CV kandidat ini terhadap posisi pekerjaan berikut.

DATA LOWONGAN:
Posisi: ${jobTitle}
Deskripsi: ${jobDescription || "N/A"}
Kualifikasi: ${jobQualifications || "N/A"}

TUGAS:
1. Identifikasi KELEBIHAN (maks 5 poin).
2. Identifikasi KEKURANGAN (maks 5 poin).
3. Berikan KESIMPULAN (2-3 kalimat).
4. Hitung PERSENTASE KESESUAIAN (0-100).
5. Tentukan REKOMENDASI (RECOMMENDED jika >80, SUGGESTED jika 50-80, NOT_RECOMMENDED jika <50).

FORMAT OUTPUT (JSON):
{
  "strengths": "string (gunakan bullet points dengan \\n)",
  "weaknesses": "string (gunakan bullet points dengan \\n)",
  "conclusion": "string",
  "matchPercentage": number,
  "recommendation": "RECOMMENDED" | "SUGGESTED" | "NOT_RECOMMENDED"
}
`;

    console.log("Sending request to Gemini API with Retry Logic...");

    // Membungkus panggilan API dengan Retry Logic
    const result = await retryWithBackoff(async () => {
      return await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64,
          },
        },
      ]);
    });

    const geminiResponse = await result.response;
    const text = geminiResponse.text();

    console.log("Raw Gemini response received");

    // Karena menggunakan responseMimeType: "application/json",
    // kita tidak perlu lagi regex cleaning (```json ... ```)
    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error. Raw text:", text);
      throw new Error("AI returned invalid JSON format");
    }

    const result_data: CVAnalysisResult = {
      strengths: analysis.strengths || "Tidak ada data",
      weaknesses: analysis.weaknesses || "Tidak ada data",
      conclusion: analysis.conclusion || "Tidak ada kesimpulan",
      recommendation: analysis.recommendation || "NOT_RECOMMENDED",
      matchPercentage: Math.min(
        100,
        Math.max(0, analysis.matchPercentage || 0),
      ),
    };

    console.log("=== GEMINI ANALYSIS SUCCESS ===");
    return result_data;
  } catch (error: any) {
    console.error("=== GEMINI ANALYSIS ERROR ===");
    console.error("Message:", error.message);

    throw new Error(
      error.message.includes("503")
        ? "Server Gemini sedang sangat sibuk. Silakan coba beberapa saat lagi."
        : `CV Analysis failed: ${error.message}`,
    );
  }
}
