import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import McpAuthCode from "@/models/McpAuthCode";
import { authenticateUser } from "@/middleware/auth";

/**
 * POST /api/mcp/auth
 * Called by the mcp-auth page after the user is confirmed logged in.
 * Marks the code as claimed by the current user.
 */
export async function POST(req) {
  try {
    await connectDB();
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Verify the requesting user is authenticated
    let user;
    try {
      user = await authenticateUser();
    } catch {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const record = await McpAuthCode.findOne({ code });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired authorization code" },
        { status: 404 },
      );
    }

    if (record.used) {
      return NextResponse.json(
        { error: "This code has already been used" },
        { status: 409 },
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Authorization code has expired" },
        { status: 410 },
      );
    }

    // Claim the code
    record.userId = user._id;
    record.used = true;
    await record.save();

    return NextResponse.json({
      success: true,
      user: { name: user.fullName, email: user.email },
    });
  } catch (err) {
    console.error("[MCP Auth] POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/mcp/auth?code=xxx
 * Called by the MCP tool to exchange a code for a userId (after user authorized).
 * Only works if the code is used (claimed) and not expired.
 */
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const record = await McpAuthCode.findOne({ code }).populate(
      "userId",
      "fullName email",
    );

    if (!record) {
      return NextResponse.json(
        { authorized: false, error: "Invalid code" },
        { status: 404 },
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { authorized: false, error: "Code expired" },
        { status: 410 },
      );
    }

    if (!record.used || !record.userId) {
      return NextResponse.json(
        { authorized: false, error: "Not yet authorized by user" },
        { status: 202 },
      );
    }

    return NextResponse.json({
      authorized: true,
      userId: record.userId._id,
      user: {
        name: record.userId.fullName,
        email: record.userId.email,
      },
    });
  } catch (err) {
    console.error("[MCP Auth] GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
