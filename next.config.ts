import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      // Batas ukuran body untuk Server Actions (upload Excel + ZIP CV)
      // Default 1MB terlalu kecil untuk fitur import applicant
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
