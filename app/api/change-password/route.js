import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    await connectDB();
    const { token, password, lang } = await request.json();
    const { searchParams } = new URL(request.url);
    const withToken = searchParams.get("withToken") === "true";

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Generate new auth token
    const authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      {
        message:
          user.lang === "ar"
            ? "تم تغيير كلمة المرور بنجاح"
            : "Password changed successfully",
        ...(withToken ? { token: authToken } : {}),
      },
      { status: 200 }
    );

    // Set new auth cookie
    response.cookies.set("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      domain: process.env.NODE_ENV === "production" ? ".estajer.com" : "",
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/change-password",
      method: "POST",
      req: request,
    });
  }
}
