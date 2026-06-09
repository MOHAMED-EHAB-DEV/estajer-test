import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");
  const lang = searchParams.get("lang");

  if (!input) {
    return NextResponse.json(
      { error: "Missing input parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${lang}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/geocode/autocomplete",
      method: "GET",
      req: request,
    });
  }
}
