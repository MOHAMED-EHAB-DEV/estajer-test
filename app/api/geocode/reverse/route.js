import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const lang = searchParams.get("lang");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing latitude or longitude" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${lang}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/geocode/reverse",
      method: "GET",
      req: request,
    });
  }
}
