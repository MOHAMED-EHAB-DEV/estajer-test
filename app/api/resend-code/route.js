import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendVerificationWhatsApp } from "@/lib/whatsapp";
import { sendVerificationEmail } from "@/lib/email";
import { handleApiError } from "@/lib/errorHandler";
import { rateLimit } from "@/lib/rate-limit";
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const getLimiter = rateLimit({
  interval: 24 * 60 * 60 * 1000, // 1 day
  uniqueTokenPerInterval: 2000,
  limit: 3,
});
export async function GET(request) {
  try {
    await getLimiter.check(request);
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get("token")?.value || request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

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
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user's verification code
    user.verificationCode = {
      code: verificationCode,
      expiresAt: verificationExpiry,
    };
    await user.save();

    // Send new verification WhatsApp message
    await sendVerificationWhatsApp({
      phone: user.phone,
      code: verificationCode,
      lang: user.lang,
    });

    // Send new verification Email
    await sendVerificationEmail({
      email: user.email,
      code: verificationCode,
      lang: user.lang,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          user.lang === "ar"
            ? "تم إرسال رمز جديد بنجاح"
            : "New verification code sent",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/resend-code",
      method: "GET",
      req: request,
    });
  }
}
