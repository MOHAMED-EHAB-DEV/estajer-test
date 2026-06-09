import connectDB from "@/lib/db";
import { NafathService } from "@/lib/nafath";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";

export async function POST(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const currentUser = client
      ? await authenticateUser()
      : await authHeaders(req);
    const nafath = new NafathService();
    const { nationalId, locale = "en" } = await req.json();

    if (!nationalId) {
      return NextResponse.json(
        { message: "National ID is required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ nationalId });
    if (existingUser) {
      return NextResponse.json(
        { message: "National ID already exists" },
        { status: 400 },
      );
    }

    const requestId = nafath.generateRequestId();
    const service = "DigitalServiceEnrollmentWithoutBio";
    const response = await fetch(
      `${nafath.baseUrl}/api/v1/mfa/request?local=${locale}&requestId=${requestId}`,
      {
        method: "POST",
        headers: nafath.getHeaders(),
        body: JSON.stringify({ nationalId, service }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    await User.findByIdAndUpdate(currentUser._id, {
      $set: { nafathTempId: nationalId },
    });

    return NextResponse.json({
      success: true,
      transId: data.transId,
      random: data.random,
      requestId,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/auth/nafath/send-request",
      method: "POST",
      req,
    });
  }
}
