import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

const ALLOWED_IPS = ["141.147.136.72", "127.0.0.1", "::1"];

function getRequestIp(request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",");
  const raw =
    request.headers.get("x-real-ip") ||
    forwarded?.[1] ||
    forwarded?.[0] ||
    "";
  return raw.trim().replace("::ffff:", "");
}

export async function POST(request) {
  try {
    const ip = getRequestIp(request);
    if (!ALLOWED_IPS.includes(ip)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isOnline } = await request.json();
    if (!userId || typeof isOnline !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    await User.updateOne(
      { _id: userId },
      { isOnline, lastSeen: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/internal/user-status",
      method: "POST",
    });
  }
}
