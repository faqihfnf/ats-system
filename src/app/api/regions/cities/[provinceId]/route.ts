import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ provinceId: string }> }
) {
  try {
    const { provinceId } = await context.params;
    
    console.log("Fetching cities for province ID:", provinceId); // debug
    
    const url = `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`;
    console.log("URL:", url); // debug
    
    const response = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 3600 } // cache 1 jam
    });
    
    console.log("Response status:", response.status); // debug
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Cities data:", data); // debug
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fetch cities error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cities" },
      { status: 500 }
    );
  }
}