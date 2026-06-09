import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Report from "@/models/Report";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

export async function POST(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const user = client ? await authenticateUser() : await authHeaders(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, reason, description } = await req.json();

    const report = await Report.create({
      product: productId,
      user: user._id,
      reason,
      description,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/reports",
      method: "POST",
      req,
    });
  }
}
