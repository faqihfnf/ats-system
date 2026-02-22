// app/api/institutions/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search");

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    // Base URL dari dokumentasi
    const baseUrl = "https://use.api.co.id/regional/indonesia/universities";

    // Parameter pencarian menggunakan 'name'
    const response = await fetch(
      `${baseUrl}?name=${encodeURIComponent(query)}&size=20`,
      {
        headers: {
          "Content-Type": "application/json",
          // Masukkan API Key Anda di sini sesuai dokumentasi
          "x-api-co-id": process.env.API_UNIVERSITY_KEY || "",
        },
      },
    );

    const result = await response.json();

    // Berdasarkan dokumentasi, data universitas ada di properti 'data'
    if (result.is_success && Array.isArray(result.data)) {
      return NextResponse.json(result.data);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("University API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
