import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    const { nationalId, certificateNumber } = await request.json();

    // Validate inputs
    if (!nationalId || !certificateNumber) {
      return NextResponse.json(
        { error: "nationalId and certificateNumber are required" },
        { status: 400 },
      );
    }

    // Validate nationalId: exactly 10 digits, must start with 1
    if (!/^1\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { error: "nationalId must be exactly 10 digits and start with 1" },
        { status: 400 },
      );
    }

    // Validate certificateNumber: exactly 12 chars, format FL-XXXXXXXXX (FL- + 9 digits)
    if (!/^FL-\d{9}$/.test(certificateNumber)) {
      return NextResponse.json(
        {
          error:
            "certificateNumber must be in format FL-XXXXXXXXX (FL- followed by 9 digits)",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      "https://integration.freelance.sa/api/v3/certificate/details-by-national-id-and-certificate-number",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "client-id": process.env.FREELANCE_CLIENT_ID,
          "app-key": process.env.FREELANCE_APP_KEY,
        },
        body: JSON.stringify({ nationalId, certificateNumber }),
      },
    );

    if (!response.ok) {
      console.log(response);
      return NextResponse.json(
        { error: "Certificate verification failed" },
        { status: 400 },
      );
    }
    const data = await response.json();

    if (!data.success) {
      // Map known error codes to user-friendly messages
      const errorMessages = {
        P001: "Invalid API credentials",
        L001: "Invalid certificate or license number",
        L020: "Certificate not linked to partner account",
      };

      const errorCode = data.result?.errorCode || data.errorCode;
      const errorMessage =
        errorMessages[errorCode] || "Certificate verification failed";

      return NextResponse.json(
        { error: errorMessage, errorCode, details: data },
        { status: 400 },
      );
    }

    return NextResponse.json(data.result); // { status, expiryDate }
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/freelance/check-certificate",
      method: "POST",
      req: request,
    });
  }
}
