// app/api/institutions/route.ts
import { NextResponse } from "next/server";

type InstitutionCategory = "school" | "university";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search");
  const categoryParam = searchParams.get("category");
  const category: InstitutionCategory =
    categoryParam === "school" ? "school" : "university";

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const baseUrl =
      category === "school"
        ? "https://use.api.co.id/regional/indonesia/schools"
        : "https://use.api.co.id/regional/indonesia/universities";
    const apiKey =
      category === "school"
        ? process.env.API_SCHOOL_KEY || process.env.API_UNIVERSITY_KEY || ""
        : process.env.API_UNIVERSITY_KEY || process.env.API_SCHOOL_KEY || "";

    const url = new URL(baseUrl);
    url.searchParams.set("name", query);
    if (category === "university") {
      url.searchParams.set("size", "20");
    } else {
      url.searchParams.set("page", "1");
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-api-co-id": apiKey,
      },
    });

    const result = await response.json();

    if (Array.isArray(result?.data)) {
      const normalizedInstitutions = result.data
        .map((item: { name?: string }) => ({
          name: typeof item?.name === "string" ? item.name.trim() : "",
        }))
        .filter((item: { name: string }) => item.name.length > 0);

      return NextResponse.json(normalizedInstitutions);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Institution API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
