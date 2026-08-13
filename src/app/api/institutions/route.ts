// app/api/institutions/route.ts
import { NextResponse } from "next/server";

type InstitutionCategory = "school" | "university";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("search");
  const categoryParam = searchParams.get("category");
  const category: InstitutionCategory =
    categoryParam === "school" ? "school" : "university";

  // API baru (apiindonesia.id): minimal 2 karakter untuk kampus, 3 untuk sekolah
  const minChars = category === "school" ? 3 : 2;
  if (!query || query.length < minChars) {
    return NextResponse.json([]);
  }

  try {
    const baseUrl =
      category === "school"
        ? "https://use.apiindonesia.id/api/v1/sekolah/search"
        : "https://use.apiindonesia.id/api/v1/kampus/search";
    const apiKey = process.env.API_EDUCATION_KEY || "";

    const url = new URL(baseUrl);
    url.searchParams.set("q", query);

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        "[institutions] External API error:",
        response.status,
        await response.text().catch(() => ""),
      );
      return NextResponse.json([]);
    }

    const result = await response.json();

    // Struktur resmi apiindonesia.id: { data: [...], meta: {...} }
    const list: unknown[] = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    const normalizedInstitutions = list
      .map((item) => {
        const obj = (item ?? {}) as Record<string, unknown>;
        const name =
          typeof obj?.name === "string"
            ? obj.name
            : typeof obj?.nama === "string"
              ? (obj.nama as string)
              : "";
        return { name: name.trim() };
      })
      .filter((item: { name: string }) => item.name.length > 0)
      // Hilangkan duplikat berdasarkan nama (case-insensitive), pertahankan urutan
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (i) => i.name.toLowerCase() === item.name.toLowerCase(),
          ),
      );

    return NextResponse.json(normalizedInstitutions);
  } catch (error) {
    console.error("Institution API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
