import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ districtId: string }> },
) {
  try {
    const { districtId } = await context.params;

    const response = await fetch(
      `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${districtId}.json`,
      { cache: "force-cache" },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch villages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch villages" },
      { status: 500 },
    );
  }
}
