import { getUserFromServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const headerToken = authHeader?.split(" ")[1];

    const user = await getUserFromServer(headerToken);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/auth/user",
      method: "GET",
      req: request,
    });
  }
}
