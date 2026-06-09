import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendResetPasswordEmail } from "@/lib/email";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "لم نجد حساباً بهذا البريد الإلكتروني" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${
      user.lang === "ar" ? "" : "en/"
    }change-password?token=${resetToken}`;
    await sendResetPasswordEmail({
      resetLink,
      lang: user.lang,
      email: user.email,
    });

    return NextResponse.json(
      {
        message:
          user.lang === "ar"
            ? "تم إرسال رابط تغيير كلمة المرور"
            : "Reset password link sent",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/forgot-password",
      method: "POST",
      req: request,
    });
  }
}
