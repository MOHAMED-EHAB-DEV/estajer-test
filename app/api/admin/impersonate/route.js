import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    await connectDB();

    const currentUser = await authenticateUser();
    if (currentUser.accountType !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { userId: targetUserId } = body;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (targetUser.accountType === "admin") {
      return NextResponse.json(
        { error: "Cannot impersonate another admin user" },
        { status: 400 }
      );
    }

    const targetToken = jwt.sign(
      { userId: targetUser._id, email: targetUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    const currentToken = cookieStore.get("token")?.value;
    const isProduction = process.env.NODE_ENV === "production";

    if (currentToken) {
      cookieStore.set("adminTempToken", currentToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        domain: isProduction ? ".estajer.com" : "",
        path: "/",
      });
    }

    cookieStore.set("isImpersonating", "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: isProduction ? ".estajer.com" : "",
      path: "/",
    });

    cookieStore.set("token", targetToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: isProduction ? ".estajer.com" : "",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: `Impersonating as ${targetUser.fullName || targetUser.name}`,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/impersonate",
      method: "POST",
      req: request,
    });
  }
}
