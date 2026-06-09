import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendVerificationWhatsApp } from "@/lib/whatsapp";
// import { sendVerificationEmail } from "@/lib/email";
import { handleApiError } from "@/lib/errorHandler";
import { sendVerificationEmail } from "@/lib/email";
import { generatePathName } from "@/lib/utils";
import { syncVisitorNotifications } from "@/lib/notifications";
import { checkFreelanceCertificateServer } from "@/lib/freelance";

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      email,
      password,
      fullName,
      phone,
      accountType,
      companyName,
      registerNumber,
      taxCode,
      lang,
      isRenter,
      documentCode,
      nationalId,
    } = body;

    // Check if email, phone, nationalId, or documentCode already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone },
        ...(nationalId ? [{ nationalId }] : []),
        ...(documentCode ? [{ documentCode }] : []),
      ],
    });

    if (existingUser) {
      let errorMessage = "Email or phone number already registered";
      if (nationalId && existingUser.nationalId === nationalId) {
        errorMessage = "National ID already registered";
      } else if (documentCode && existingUser.documentCode === documentCode) {
        errorMessage = "Document code already registered";
      }
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      email,
      password: hashedPassword,
      fullName,
      phone,
      lang,
      isRenter,
      pathName: generatePathName(email),
      accountType: accountType === "company" ? "company" : "personal",
      verificationCode: {
        code: verificationCode,
        expiresAt: verificationExpiry,
      },
    };

    if (accountType === "company") {
      userData.companyDetails = { companyName, registerNumber, taxCode };
    }

    // Handle freelance document verification
    if (documentCode && nationalId) {
      // Validate formats server-side
      if (!/^1\d{9}$/.test(nationalId)) {
        return NextResponse.json(
          { error: "National ID must be exactly 10 digits and start with 1" },
          { status: 400 },
        );
      }
      if (!/^FL-\d{9}$/.test(documentCode)) {
        return NextResponse.json(
          { error: "Document code must be in format FL-XXXXXXXXX" },
          { status: 400 },
        );
      }

      // Server-side re-verification to prevent tampering
      try {
        const certResult = await checkFreelanceCertificateServer({
          nationalId,
          certificateNumber: documentCode,
        });

        if (certResult.status !== "ACTIVE") {
          return NextResponse.json(
            {
              error: `Freelance certificate is not active (status: ${certResult.status})`,
            },
            { status: 400 },
          );
        }

        userData.documentCode = documentCode;
        userData.nationalId = nationalId;
        userData.freelanceCertificate = {
          status: certResult.status,
          expiryDate: certResult.expiryDate,
          verifiedAt: new Date(),
        };
      } catch (error) {
        return NextResponse.json(
          {
            error: error.message || "Freelance certificate verification failed",
          },
          { status: 400 },
        );
      }
    }
    const isProduction = process.env.NODE_ENV === "production";
    // Send verification WhatsApp message
    if (isProduction) {
      await sendVerificationWhatsApp({
        phone: userData.phone,
        code: verificationCode,
        lang,
      });
    } else {
      // Send verification Email
      await sendVerificationEmail({
        email: userData.email,
        code: verificationCode,
        lang,
      });
    }

    // Create new user
    const newUser = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Sync visitor notifications
    await syncVisitorNotifications(newUser, request);

    // Create response with cookie
    const response = NextResponse.json(
      {
        message:
          lang === "ar"
            ? "تم التسجيل بنجاح. يرجى التحقق من الواتساب."
            : "User registered successfully. Please check your WhatsApp.",
      },
      { status: 201 },
    );

    // Set HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: process.env.NODE_ENV === "production" ? ".estajer.com" : "",
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/register",
      method: "POST",
      req: request,
    });
  }
}
