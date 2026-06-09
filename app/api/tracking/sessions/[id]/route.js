import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import handleApiError from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";
import zlib from "zlib";
import { promisify } from "util";

const gunzip = promisify(zlib.gunzip);

const RECORDINGS_DIR = path.join(process.cwd(), ".cache", "recordings");

export async function GET(request, { params }) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const client = searchParams.get("client");

    // Check if user is admin
    const user = client ? await authenticateUser() : await authHeaders(request);
    if (!user || user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventsPathGz = path.join(RECORDINGS_DIR, sessionId, "events.json.gz");
    const eventsPathRaw = path.join(RECORDINGS_DIR, sessionId, "events.json");
    const metadataPath = path.join(RECORDINGS_DIR, sessionId, "metadata.json");

    try {
      let eventsData;
      try {
        // Try compressed first
        const compressed = await fs.readFile(eventsPathGz);
        const decompressed = await gunzip(compressed);
        eventsData = JSON.parse(decompressed.toString());
      } catch (err) {
        // Fallback to raw json if exists
        const raw = await fs.readFile(eventsPathRaw, "utf8");
        eventsData = JSON.parse(raw);
      }

      const metadataStr = await fs.readFile(metadataPath, "utf8");

      return NextResponse.json({
        events: eventsData,
        metadata: JSON.parse(metadataStr),
      });
    } catch (e) {
      return NextResponse.json(
        { error: "Session data not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return handleApiError(error, {
      endpoint: "api/tracking/sessions/[id]",
      method: "GET",
      req: request,
    });
  }
}
export async function DELETE(request, { params }) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const client = searchParams.get("client");

    // Check if user is admin
    const user = client ? await authenticateUser() : await authHeaders(request);
    if (!user || user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionDir = path.join(RECORDINGS_DIR, sessionId);

    // Check if session directory exists
    try {
      await fs.access(sessionDir);
    } catch (e) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete the entire session directory
    await fs.rm(sessionDir, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "api/tracking/sessions/[id]",
      method: "DELETE",
      req: request,
    });
  }
}
