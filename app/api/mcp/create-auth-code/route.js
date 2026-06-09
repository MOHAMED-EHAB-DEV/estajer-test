import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import McpAuthCode from "@/models/McpAuthCode";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
const EXPIRY_MINUTES = 1440; // 24 hours

/**
 * POST /api/mcp/create-auth-code
 * Creates a new single-use auth code and returns the authorization URL.
 * Called only by the MCP server tool (not directly by users).
 */
export async function POST() {
  try {
    await connectDB();

    const code = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await McpAuthCode.create({ code, expiresAt });

    const authUrl = `${BASE_URL}/mcp-auth?code=${code}`;

    return NextResponse.json({
      success: true,
      auth_url: authUrl,
      expires_in_minutes: EXPIRY_MINUTES,
      code, // returned so the MCP tool can later poll /api/mcp/auth?code=xxx
    });
  } catch (err) {
    console.error("[MCP create-auth-code] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
