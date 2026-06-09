import connectDB from "@/lib/db";
import { NafathService } from "@/lib/nafath";
import { authenticateUser } from "@/middleware/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

export async function POST(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  const user = client
    ? await authenticateUser()
    : await authHeaders(req);

  const nafath = new NafathService();
  const { nationalId, transId, random } = await req.json();

  if (!nationalId || !transId || !random) {
    return NextResponse.json(
      {
        message: "National ID, transaction ID, and random number are required",
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${nafath.baseUrl}/api/v1/mfa/request/status`,
      {
        method: "POST",
        headers: nafath.getHeaders(),
        body: JSON.stringify({ nationalId, transId, random }),
      },
    );

    const data = await response.json();

    if (!response.ok)
      return NextResponse.json(data, { status: response.status });

    if (data.status === "COMPLETED") {
      await User.findByIdAndUpdate(user._id, {
        nationalId,
        nafathVerified: true,
        nafathTempId: undefined,
      });
    }
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/auth/nafath/check-status",
      method: "POST",
      req,
    });
  }
}
