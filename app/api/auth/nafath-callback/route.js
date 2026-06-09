import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { importJWK, jwtVerify } from "jose";
import { NafathService } from "@/lib/nafath";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";

async function verifyNafathToken(token) {
  try {
    await connectDB();
    const nafath = new NafathService();
    const jwkResponse = await fetch(`${nafath.baseUrl}/api/v1/mfa/jwk`, {
      headers: nafath.getHeaders(),
    });

    const jwkData = await jwkResponse.json();
    const jwk = jwkData.keys[0];

    const publicKey = await importJWK(jwk);
    const { payload } = await jwtVerify(token, publicKey);

    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

async function processAuthenticationResult(decoded) {
  await connectDB();
  console.log("decoded: ", decoded);
  const nationalId = decoded.nin || decoded.iqamaNumber || decoded.sub;
  const user = await User.findOne({
    $or: [{ nationalId: nationalId }, { nafathTempId: nationalId }],
  });
  if (user) {
    user.nafathVerified = true;
    user.nationalId = nationalId;
    user.nafathData = {
      // Arabic Names
      firstNameAr: decoded.firstName,
      fatherNameAr: decoded.fatherName || decoded.secondName,
      grandFatherNameAr: decoded.grandFatherName || decoded.thirdName,
      lastNameAr: decoded.familyName || decoded.lastName,
      // English Names
      firstNameEn: decoded.englishFirstName,
      fatherNameEn: decoded.englishSecondName,
      grandFatherNameEn: decoded.englishThirdName,
      lastNameEn: decoded.englishLastName,
      // Important Dates
      dateOfBirthG: decoded.dateOfBirthG, // Gregorian
      dateOfBirthH: decoded.dateOfBirthH, // Hijri
      // Identity Details
      gender: decoded.gender,
      nationality: decoded.nationality || decoded.nationalityDesc,
      nationalityCode: decoded.nationalityCode,
      // ID Expiry/Issue (Useful for verification logic)
      expiryDateG: decoded.idExpiryDateG || decoded.iqamaExpiryDateG,
      issuePlace: decoded.idIssuePlace || decoded.iqamaIssuePlaceDesc,

      // Nafath Metadata
      transId: decoded.transId,
      status: decoded.status,
    };
    user.nafathTempId = undefined;
    await user.save();
  } else {
    throw new Error("User not found for nafathTempId:", decoded);
  }
}

export async function POST(request) {
  try {
    const { token, transId, requestId } = await request.json();

    if (!token || !transId || !requestId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const verified = await verifyNafathToken(token);

    if (!verified)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const decoded = jwt.decode(token);

    await processAuthenticationResult(decoded);

    return NextResponse.json({ message: "Callback processed successfully" });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/auth/nafath-callback",
      method: "POST",
      req: request,
    });
  }
}
