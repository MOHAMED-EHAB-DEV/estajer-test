import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { authenticateUser } from "@/middleware/auth";

export async function POST(req) {
  try {
    await connectDB();

    // Ensure only admins can use this tool
    const currentUser = await authenticateUser();
    if (currentUser.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select(
        "-password -confirmPassword"
      );

      if (!user) {
        return NextResponse.json({
          success: false,
          decoded,
          error: "User not found in database",
        });
      }

      return NextResponse.json({
        success: true,
        decoded,
        user,
      });
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: err.message,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
