import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token")?.value ||
      request.headers.get("Authorization")?.split(" ")[1] ||
      request.headers.get("Authorization");

    if (!token)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.set({ isOnline: true, lastSeen: Date.now() });
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return handleApiError(error, {
      endpoint: "/api/auth/user/online",
      method: "POST",
    });
  }
}
