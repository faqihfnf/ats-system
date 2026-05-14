const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export type CVAnalysisResult = {
  strengths: string;
  weaknesses: string;
  conclusion: string;
  recommendation: "RECOMMENDED" | "SUGGESTED" | "NOT_RECOMMENDED";
  matchPercentage: number;
};

/**
 * Retry dengan Exponential Backoff.
 * Menangani error 503, 429, dan error sementara lainnya.
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

      const errorMessage = error.message?.toLowerCase() || "";
      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("service unavailable") ||
        errorMessage.includes("too many requests") ||
        errorMessage.includes("rate limit");

      if (isRetryable && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(
          `[OpenRouter] Rate limited/busy. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Analisis CV menggunakan OpenRouter API.
 * Mengirim extracted text (bukan PDF) ke model yang dipilih user.
 */
export async function analyzeCVWithOpenRouter(
  cvText: string,
  jobDescription: string,
  jobQualifications: string,
  jobTitle: string,
  modelId: string,
): Promise<CVAnalysisResult> {
  try {
    console.log("=== OPENROUTER ANALYSIS START ===");
    console.log(`[OpenRouter] Using model: ${modelId}`);

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    const prompt = `Kamu adalah seorang rekruter profesional. Analisis CV kandidat ini terhadap posisi pekerjaan berikut.

DATA LOWONGAN:
Posisi: ${jobTitle}
Deskripsi: ${jobDescription || "N/A"}
Kualifikasi: ${jobQualifications || "N/A"}

DATA KANDIDAT (CV):
${cvText}

TUGAS:
1. Identifikasi KELEBIHAN (maks 5 poin).
2. Identifikasi KEKURANGAN (maks 5 poin).
3. Berikan KESIMPULAN (2-3 kalimat).
4. Hitung PERSENTASE KESESUAIAN (0-100).
5. Tentukan REKOMENDASI (RECOMMENDED jika >80, SUGGESTED jika 50-80, NOT_RECOMMENDED jika <50).
6. Jika data bukan sebuah resume/cv, berikan nilai 0% dan jelaskan bahwa data tidak valid. dan pada bagian "strengths" dan "weaknesses" berikan output"Data tidak valid".

FORMAT OUTPUT (JSON saja, tanpa markdown):
{
  "strengths": "string (gunakan bullet points dengan \\n)",
  "weaknesses": "string (gunakan bullet points dengan \\n)",
  "conclusion": "string",
  "matchPercentage": number,
  "recommendation": "RECOMMENDED" | "SUGGESTED" | "NOT_RECOMMENDED"
}`;

    console.log("[OpenRouter] Sending request...");

    const result = await retryWithBackoff(async () => {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorBody}`,
        );
      }

      return response;
    });

    const data = await result.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from OpenRouter");
    }

    console.log("[OpenRouter] Raw response received");

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error("[OpenRouter] JSON parse error. Raw text:", text);
      throw new Error("AI returned invalid JSON format");
    }

    const resultData: CVAnalysisResult = {
      strengths: analysis.strengths || "Tidak ada data",
      weaknesses: analysis.weaknesses || "Tidak ada data",
      conclusion: analysis.conclusion || "Tidak ada kesimpulan",
      recommendation: analysis.recommendation || "NOT_RECOMMENDED",
      matchPercentage: Math.min(
        100,
        Math.max(0, analysis.matchPercentage || 0),
      ),
    };

    console.log("=== OPENROUTER ANALYSIS SUCCESS ===");
    return resultData;
  } catch (error: any) {
    console.error("=== OPENROUTER ANALYSIS ERROR ===");
    console.error("Message:", error.message);

    throw new Error(
      error.message.includes("503")
        ? "Server AI sedang sangat sibuk. Silakan coba beberapa saat lagi."
        : `CV Analysis failed: ${error.message}`,
    );
  }
}
