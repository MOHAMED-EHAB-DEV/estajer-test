import User from "@/models/User";
import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import handleApiError from "@/lib/errorHandler";

export async function GET() {
  try {
    const user = await authenticateUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    await User.findOneAndUpdate(
      { _id: user._id },
      { unsubscribed: true },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/auth/unsubcribe",
      method: "GET",
    });
  }
}
