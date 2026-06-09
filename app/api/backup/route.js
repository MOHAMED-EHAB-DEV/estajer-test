import { NextResponse } from "next/server";
import { runDatabaseBackup } from "@/lib/cron/databaseBackup";
import { handleApiError } from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const result = await runDatabaseBackup();
    return NextResponse.json({
      success: true,
      message: "Manual database backup triggered successfully",
      details: result,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/backup",
      method: "GET",
      req,
    });
  }
}
