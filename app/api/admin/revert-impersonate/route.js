import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const adminTempToken = cookieStore.get("adminTempToken")?.value;

    if (!adminTempToken) {
      return NextResponse.json(
        { error: "No impersonation session found" },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(adminTempToken, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid admin token" },
        { status: 400 }
      );
    }

    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || adminUser.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin session" },
        { status: 401 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("token", adminTempToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: isProduction ? ".estajer.com" : "",
      path: "/",
    });

    cookieStore.set("adminTempToken", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 0,
      domain: isProduction ? ".estajer.com" : "",
      path: "/",
    });
    cookieStore.set("isImpersonating", "", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 0,
      domain: isProduction ? ".estajer.com" : "",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully reverted back to admin account",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/revert-impersonate",
      method: "POST",
      req: request,
    });
  }
}
