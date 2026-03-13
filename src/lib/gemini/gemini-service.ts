import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type CVAnalysisResult = {
  strengths: string;
  weaknesses: string;
  conclusion: string;
  recommendation: "RECOMMENDED" | "SUGGESTED" | "NOT_RECOMMENDED";
  matchPercentage: number;
};

export async function analyzeCVWithGemini(
  cvUrl: string,
  jobDescription: string,
  jobQualifications: string,
  jobTitle: string,
): Promise<CVAnalysisResult> {
  try {
    console.log("=== GEMINI ANALYSIS START ===");
    console.log("CV URL:", cvUrl);
    console.log("Job Title:", jobTitle);

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("Fetching PDF from URL...");

    // Fetch PDF as base64
    const response = await fetch(cvUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`,
      );
    }

    console.log("PDF fetched successfully, converting to base64...");

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    console.log("PDF size:", arrayBuffer.byteLength, "bytes");
    console.log("Base64 length:", base64.length);

    const prompt = `
Kamu adalah seorang rekruter profesional yang ahli dalam analisis CV dan screening kandidat.

TUGAS:
Analisis CV kandidat berikut dan bandingkan dengan lowongan pekerjaan yang tersedia.

DATA LOWONGAN:
Posisi: ${jobTitle}
Deskripsi Pekerjaan: ${jobDescription || "Tidak tersedia"}
Kualifikasi yang Dibutuhkan: ${jobQualifications || "Tidak tersedia"}

INSTRUKSI ANALISIS:
1. Baca CV dengan teliti (termasuk layout, format, dan isi)
2. Identifikasi KELEBIHAN kandidat (maksimal 5 poin, fokus pada kesesuaian dengan posisi)
3. Identifikasi KEKURANGAN kandidat (maksimal 5 poin, fokus pada gap antara CV dan requirement)
4. Berikan KESIMPULAN singkat (2-3 kalimat)
5. Berikan PERSENTASE KESESUAIAN (0-100%) berdasarkan:
   - Kesesuaian pengalaman kerja dengan posisi (40%)
   - Kesesuaian pendidikan (20%)
   - Kesesuaian skill/kompetensi (30%)
   - Kesesuaian lainnya (10%)

KRITERIA REKOMENDASI:
- RECOMMENDED: Kesesuaian > 80% (kandidat sangat cocok)
- SUGGESTED: Kesesuaian 50-80% (kandidat cukup cocok, perlu pertimbangan lebih lanjut)
- NOT_RECOMMENDED: Kesesuaian < 50% (kandidat kurang cocok)

FORMAT OUTPUT (WAJIB JSON):
{
  "strengths": "• Poin 1\\n• Poin 2\\n• Poin 3",
  "weaknesses": "• Poin 1\\n• Poin 2\\n• Poin 3",
  "conclusion": "Kesimpulan singkat dalam 2-3 kalimat",
  "matchPercentage": 75,
  "recommendation": "SUGGESTED"
}

PENTING:
- Output harus PURE JSON tanpa markdown backticks
- Gunakan bahasa Indonesia yang profesional
- Fokus pada fakta dari CV, bukan asumsi
- Berikan analisis yang objektif dan konstruktif
`;

    console.log("Sending request to Gemini API...");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
    ]);

    console.log("Gemini API response received");

    const geminiResponse = await result.response;
    const text = geminiResponse.text();

    console.log("Raw Gemini response:", text);

    // Clean response
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

    console.log("Cleaned response:", cleanedText);

    // Parse JSON
    let analysis;
    try {
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse:", cleanedText);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Parsed analysis:", analysis);

    // Validate and return
    const result_data = {
      strengths: analysis.strengths || "Tidak ada data",
      weaknesses: analysis.weaknesses || "Tidak ada data",
      conclusion: analysis.conclusion || "Tidak ada kesimpulan",
      recommendation: analysis.recommendation || "SUGGESTED",
      matchPercentage: Math.min(
        100,
        Math.max(0, analysis.matchPercentage || 0),
      ),
    };

    console.log("=== GEMINI ANALYSIS SUCCESS ===");
    console.log("Final result:", result_data);

    return result_data;
  } catch (error) {
    console.error("=== GEMINI ANALYSIS ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error,
    );
    console.error("Full error:", error);

    throw new Error(
      error instanceof Error
        ? `Gemini API failed: ${error.message}`
        : "Failed to analyze CV with AI",
    );
  }
}
