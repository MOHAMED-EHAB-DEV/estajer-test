import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      domain: process.env.NODE_ENV === "production" ? ".estajer.com" : "",
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/logout",
      method: "GET",
    });
  }
}
