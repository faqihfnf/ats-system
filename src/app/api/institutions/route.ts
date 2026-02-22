import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const apiKey = process.env.API_UNIVERSITY_KEY;

    if (!apiKey) {
      console.error("API_UNIVERSITY_KEY not found in environment variables");
      return NextResponse.json([]);
    }

    const response = await fetch(
      `https://api.api.co.id/v1/university?name=${encodeURIComponent(search)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("API response not ok:", response.status);
      return NextResponse.json([]);
    }

    const data = await response.json();

    // Format response sesuai struktur API
    // Biasanya response: { data: [...universities] }
    return NextResponse.json(data.data || []);
  } catch (error) {
    console.error("Fetch institutions error:", error);
    return NextResponse.json([]);
  }
}
