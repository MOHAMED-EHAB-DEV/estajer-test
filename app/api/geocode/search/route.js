import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const placeId = searchParams.get("place_id");
  const lang = searchParams.get("lang");

  if (!address && !placeId) {
    return NextResponse.json(
      { error: "Missing address parameter" },
      { status: 400 }
    );
  }
  const params = new URLSearchParams();
  address && params.append("address", address);
  placeId && params.append("place_id", placeId);
  params.append("key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  params.append("language", lang);
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/geocode/search",
      method: "GET",
      req: request,
    });
  }
}
