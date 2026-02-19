import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json",
      { cache: "force-cache" } // cache untuk performance
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch provinces error:", error);
    return NextResponse.json({ error: "Failed to fetch provinces" }, { status: 500 });
  }
}