/**
 * DISC Scoring Engine
 *
 * Scoring rules:
 * - MOST answer: +1 untuk dimensi yang dipilih
 * - LEAST answer: -1 untuk dimensi yang dipilih
 * - Normalisasi: shift semua skor agar minimum = 0
 *
 * Total 28 soal → range raw: -28 sampai +28 per dimensi
 * Setelah normalisasi: 0 sampai 56 per dimensi
 */

export type DiscDimension = "D" | "I" | "S" | "C";

export type DiscAnswerInput = {
  answerMost: DiscDimension;
  answerLeast: DiscDimension;
};

export type DiscScoreResult = {
  scoreD: number;
  scoreI: number;
  scoreS: number;
  scoreC: number;
  dominantType: DiscDimension;
  profileLabel: string;
};

const PROFILE_LABELS: Record<DiscDimension, string> = {
  D: "The Driver",
  I: "The Influencer",
  S: "The Supporter",
  C: "The Analyzer",
};

export function calculateDiscScore(answers: DiscAnswerInput[]): DiscScoreResult {
  // Raw scores
  const raw = { D: 0, I: 0, S: 0, C: 0 };

  for (const answer of answers) {
    raw[answer.answerMost] += 1;
    raw[answer.answerLeast] -= 1;
  }

  // Normalisasi: shift agar minimum = 0
  const minScore = Math.min(raw.D, raw.I, raw.S, raw.C);
  const scoreD = raw.D - minScore;
  const scoreI = raw.I - minScore;
  const scoreS = raw.S - minScore;
  const scoreC = raw.C - minScore;

  // Determine dominant type
  const scores: [DiscDimension, number][] = [
    ["D", scoreD],
    ["I", scoreI],
    ["S", scoreS],
    ["C", scoreC],
  ];

  scores.sort((a, b) => b[1] - a[1]);
  const dominantType = scores[0][0];

  return {
    scoreD,
    scoreI,
    scoreS,
    scoreC,
    dominantType,
    profileLabel: PROFILE_LABELS[dominantType],
  };
}

/**
 * Validasi jawaban:
 * - Harus ada 28 jawaban
 * - MOST dan LEAST tidak boleh sama
 */
export function validateDiscAnswers(
  answers: DiscAnswerInput[],
): { valid: boolean; error?: string } {
  if (answers.length !== 28) {
    return { valid: false, error: `Harus ada 28 jawaban, diterima ${answers.length}` };
  }

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].answerMost === answers[i].answerLeast) {
      return {
        valid: false,
        error: `Soal ${i + 1}: MOST dan LEAST tidak boleh sama`,
      };
    }
  }

  return { valid: true };
}
