import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";
import { syncVisitorNotifications } from "@/lib/notifications";

export async function POST(request) {
  try {
    await connectDB();

    // Parse request body with explicit error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse login request body:", parseError.message);
      return NextResponse.json(
        { error: "Invalid request body - could not parse JSON" },
        { status: 400 },
      );
    }

    const { email, password, rememberMe, lang } = body;
    const { searchParams } = new URL(request.url);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        {
          error:
            lang === "ar"
              ? "البريد الالكتروني او كلمة المرور غير صحيحة"
              : "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword && isProduction) {
      return NextResponse.json(
        {
          error:
            lang === "ar"
              ? "البريد الالكتروني او كلمة المرور غير صحيحة"
              : "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "7d" },
    );

    // Sync visitor notifications
    await syncVisitorNotifications(user, request);

    // Create response
    const response = NextResponse.json(
      {
        message: lang === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful",
        user: {
          fullName: user.fullName,
          email: user.email,
          accountType: user.accountType,
        },
      },
      { status: 200 },
    );

    // Set HttpOnly cookie

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days : 7 days
      domain: process.env.NODE_ENV === "production" ? ".estajer.com" : "",
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/login",
      method: "POST",
      req: request,
    });
  }
}
