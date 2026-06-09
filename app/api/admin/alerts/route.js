import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Alert from "@/models/Alert";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const alert = await Alert.findOne({});
    return NextResponse.json({ success: true, data: alert || {} });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/alerts",
      method: "GET",
      req,
    });
  }
}
