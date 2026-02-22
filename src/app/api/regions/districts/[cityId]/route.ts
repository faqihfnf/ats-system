import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ cityId: string }> },
) {
  try {
    const { cityId } = await context.params;

    const response = await fetch(
      `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${cityId}.json`,
      { cache: "force-cache" },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch districts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch districts" },
      { status: 500 },
    );
  }
}
