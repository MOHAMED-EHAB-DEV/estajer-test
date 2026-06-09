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
    const token = cookieStore.get("token")?.value || request.headers.get("Authorization")?.split(" ")[1];
    const { searchParams } = new URL(request.url);
    const withToken = searchParams.get("withToken") === "true";

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify token and get user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { code } = await request.json();

    const user = await User.findById(decoded.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Phone already verified" },
        { status: 400 }
      );
    }

    if (!user.isVerificationCodeValid(code)) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    // Generate new token with verified status
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, isVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message:
          user.lang === "ar"
            ? "تم التحقق من رقم الهاتف بنجاح"
            : "Phone verified successfully",
        ...(withToken ? { token: newToken } : {}),
      },
      { status: 200 }
    );

    // Update token cookie
    response.cookies.set("token", newToken, {
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
      endpoint: "/api/verify",
      method: "POST",
      req: request,
    });
  }
}
