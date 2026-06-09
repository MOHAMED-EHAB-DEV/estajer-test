import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import waffyAuth from "@/lib/waffy-auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET() {
  try {
    // Authenticate the user
    const user = await authenticateUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    // Get customer token using the client user token
    const customerToken = await waffyAuth.getCustomerToken({
      clientUserToken: user.clientUserToken,
      phone: user.phone,
    });

    return NextResponse.json({
      success: true,
      data: { userToken: customerToken },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/user-token",
      method: "GET",
      // No req object available in this specialized GET function signature in the file?
      // Wait, the file defined `export async function GET() {` without args!
      // I should add `req` to the function signature if I want to log it, or just pass empty.
      // But looking at the file content, it doesn't use `req`.
      // I'll update the function signature too.
      req: {},
    });
  }
}
