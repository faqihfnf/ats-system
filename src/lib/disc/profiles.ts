/**
 * DISC Profile Descriptions
 * Narasi untuk setiap tipe dominan DISC
 */

export type DiscProfile = {
  type: string;
  label: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  suitableRoles: string[];
  workStyle: string;
  communication: string;
};

export const DISC_PROFILES: Record<string, DiscProfile> = {
  D: {
    type: "D",
    label: "The Driver",
    title: "Dominance",
    description:
      "Individu dengan tipe D adalah pribadi yang tegas, berorientasi pada hasil, dan menyukai tantangan. Mereka cenderung mengambil keputusan dengan cepat dan tidak takut menghadapi konflik untuk mencapai tujuan.",
    strengths: [
      "Tegas dan percaya diri",
      "Berorientasi pada hasil",
      "Mampu mengambil keputusan cepat",
      "Tidak takut tantangan",
      "Pemimpin alami",
    ],
    weaknesses: [
      "Bisa terkesan terlalu dominan",
      "Kurang sabar dengan proses yang lambat",
      "Kadang mengabaikan perasaan orang lain",
      "Cenderung terlalu kompetitif",
    ],
    suitableRoles: [
      "Manajer / Team Lead",
      "Sales Executive",
      "Entrepreneur",
      "Project Manager",
      "Operations Director",
    ],
    workStyle:
      "Menyukai lingkungan kerja yang cepat, penuh tantangan, dan memberikan otonomi. Lebih suka memimpin daripada dipimpin.",
    communication:
      "Langsung ke poin, tidak suka basa-basi. Menghargai efisiensi dalam komunikasi.",
  },
  I: {
    type: "I",
    label: "The Influencer",
    title: "Influence",
    description:
      "Individu dengan tipe I adalah pribadi yang antusias, optimis, dan pandai membangun hubungan. Mereka energik, kreatif, dan mampu memotivasi orang lain dengan karisma alami mereka.",
    strengths: [
      "Komunikator yang baik",
      "Antusias dan optimis",
      "Pandai membangun relasi",
      "Kreatif dan inovatif",
      "Mampu memotivasi tim",
    ],
    weaknesses: [
      "Kurang fokus pada detail",
      "Bisa terlalu banyak bicara",
      "Kadang kurang terorganisir",
      "Cenderung menghindari konflik",
    ],
    suitableRoles: [
      "Marketing / PR",
      "Trainer / Coach",
      "Customer Relations",
      "Creative Director",
      "Brand Ambassador",
    ],
    workStyle:
      "Menyukai lingkungan kerja yang kolaboratif, dinamis, dan memberikan kesempatan untuk berinteraksi dengan banyak orang.",
    communication:
      "Ekspresif, storytelling, suka diskusi. Menghargai pengakuan dan apresiasi.",
  },
  S: {
    type: "S",
    label: "The Supporter",
    title: "Steadiness",
    description:
      "Individu dengan tipe S adalah pribadi yang sabar, loyal, dan dapat diandalkan. Mereka menyukai stabilitas, bekerja dengan konsisten, dan sangat peduli terhadap harmoni dalam tim.",
    strengths: [
      "Sabar dan pendengar yang baik",
      "Loyal dan dapat diandalkan",
      "Bekerja konsisten dan teliti",
      "Menjaga harmoni tim",
      "Supportive terhadap rekan kerja",
    ],
    weaknesses: [
      "Sulit beradaptasi dengan perubahan mendadak",
      "Cenderung menghindari konfrontasi",
      "Kadang terlalu pasif",
      "Butuh waktu lebih lama untuk mengambil keputusan",
    ],
    suitableRoles: [
      "Customer Service",
      "HR / People Operations",
      "Admin / Secretary",
      "Counselor",
      "Quality Assurance",
    ],
    workStyle:
      "Menyukai lingkungan kerja yang stabil, terstruktur, dan harmonis. Lebih produktif dengan rutinitas yang jelas.",
    communication:
      "Tenang, empatis, dan mendengarkan dengan baik. Menghargai ketulusan dan konsistensi.",
  },
  C: {
    type: "C",
    label: "The Analyzer",
    title: "Conscientiousness",
    description:
      "Individu dengan tipe C adalah pribadi yang analitis, teliti, dan berorientasi pada kualitas. Mereka menyukai data, fakta, dan prosedur yang jelas sebelum mengambil keputusan.",
    strengths: [
      "Analitis dan detail-oriented",
      "Standar kualitas tinggi",
      "Sistematis dan terorganisir",
      "Akurat dalam pekerjaan",
      "Pemikir kritis",
    ],
    weaknesses: [
      "Bisa terlalu perfeksionis",
      "Overthinking sebelum bertindak",
      "Kurang fleksibel",
      "Kadang terlalu kritis terhadap diri sendiri dan orang lain",
    ],
    suitableRoles: [
      "Finance / Accounting",
      "Data Analyst",
      "Software Engineer",
      "Auditor",
      "Research & Development",
    ],
    workStyle:
      "Menyukai lingkungan kerja yang terstruktur dengan standar yang jelas. Butuh waktu dan ruang untuk menganalisis sebelum bertindak.",
    communication:
      "Faktual, berbasis data, dan terstruktur. Menghargai kejelasan dan akurasi informasi.",
  },
};

export function getDiscProfile(dominantType: string): DiscProfile {
  return DISC_PROFILES[dominantType] || DISC_PROFILES["D"];
}
