import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import handleApiError from "@/lib/errorHandler";
import zlib from "zlib";
import { promisify } from "util";

const gzip = promisify((data, callback) =>
  zlib.gzip(data, { level: 1 }, callback),
);
const gunzip = promisify(zlib.gunzip);

const RECORDINGS_DIR = path.join(process.cwd(), ".cache", "recordings");

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

// Simple file locking mechanism to prevent concurrent writes
const locks = new Map();

async function acquireLock(key, maxWait = 5000) {
  const startTime = Date.now();
  while (locks.get(key)) {
    if (Date.now() - startTime > maxWait) {
      throw new Error(`Lock timeout for ${key}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  locks.set(key, true);
}

function releaseLock(key) {
  locks.delete(key);
}

// Safe JSON read with validation and error recovery
async function safeReadJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    // Validate that the content is valid JSON before parsing
    const trimmed = content.trim();

    // Check for multiple JSON objects (corruption indicator)
    const firstBraceIndex = trimmed.indexOf("{");
    const lastBraceIndex = trimmed.lastIndexOf("}");

    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      console.error(`Invalid JSON structure in ${filePath}`);
      return null;
    }

    // Extract only the first complete JSON object
    const validJSON = trimmed.substring(firstBraceIndex, lastBraceIndex + 1);

    // Additional validation: count braces
    const openBraces = (validJSON.match(/{/g) || []).length;
    const closeBraces = (validJSON.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      console.error(`Mismatched braces in ${filePath}`);
      return null;
    }

    return JSON.parse(validJSON);
  } catch (error) {
    // ENOENT = file doesn't exist yet, which is expected when metadata
    // hasn't been created (e.g. pageview/events arrived before init)
    if (error.code !== "ENOENT") {
      console.error(`Error reading JSON from ${filePath}:`, error.message);
    }
    return null;
  }
}

// Ensure metadata.json exists for a session, creating a minimal one if needed.
async function ensureMetadata(sessionDir, sessionId) {
  const metadataPath = path.join(sessionDir, "metadata.json");
  try {
    const minimalMeta = JSON.stringify(
      {
        sessionId,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageViews: [],
        journeyPath: [],
        user: null,
      },
      null,
      2,
    );
    // 'wx' flag: create file only if it doesn't exist — atomic check+create
    await fs.writeFile(metadataPath, minimalMeta, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (e) {}
}

// Safe JSON write with atomic operation using unique temp files
// Each write uses a random suffix to avoid cross-process collisions (PM2)
async function safeWriteJSON(filePath, data) {
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const tempPath = `${filePath}.${randomSuffix}.tmp`;
  const jsonString = JSON.stringify(data, null, 2);

  try {
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    await ensureDir(dir);

    // Write to uniquely-named temp file
    await fs.writeFile(tempPath, jsonString, "utf8");

    // Atomic rename
    await fs.rename(tempPath, filePath);
  } catch (error) {
    try {
      await fs.unlink(tempPath);
    } catch (e) {}
    throw error;
  }
}

export async function POST(request) {
  try {
    // Read the raw text first to avoid stream consumption issues
    const rawBody = await request.text();

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError.message);
      console.error("Raw request body:", rawBody);
      return NextResponse.json(
        {
          success: false,
          error: jsonError.message,
          details: "Failed to parse JSON request body",
        },
        { status: 400 },
      );
    }
    const { sessionId, visitorId, events, metadata, type } = data;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const sessionDir = path.join(RECORDINGS_DIR, sessionId);
    await ensureDir(sessionDir);

    if (type === "init") {
      // Save metadata with locking to prevent race conditions
      const metadataPath = path.join(sessionDir, "metadata.json");
      const lockKey = `metadata_${sessionId}`;

      try {
        await acquireLock(lockKey);

        const existingMetadata = await safeReadJSON(metadataPath);
        let newMetadata = metadata || {};

        if (existingMetadata) {
          newMetadata = { ...existingMetadata, ...metadata };
        }

        await safeWriteJSON(metadataPath, {
          ...newMetadata,
          sessionId,
          visitorId,
          user: data.user || null,
          pageViews: existingMetadata?.pageViews || [],
          journeyPath: existingMetadata?.journeyPath || [],
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(
          `Error writing metadata for session ${sessionId}:`,
          error,
        );
      } finally {
        releaseLock(lockKey);
      }
    } else if (type === "identity") {
      // Update metadata with user identity
      const metadataPath = path.join(sessionDir, "metadata.json");
      const lockKey = `metadata_${sessionId}`;

      try {
        await acquireLock(lockKey);
        await ensureMetadata(sessionDir, sessionId);

        const meta = await safeReadJSON(metadataPath);
        if (meta) {
          meta.user = data.user;
          meta.updatedAt = new Date().toISOString();
          await safeWriteJSON(metadataPath, meta);
        }
      } catch (e) {
        console.error("Error updating user identity:", e);
      } finally {
        releaseLock(lockKey);
      }
    } else if (type === "pageview") {
      // Update metadata with page view
      const metadataPath = path.join(sessionDir, "metadata.json");
      const lockKey = `metadata_${sessionId}`;

      try {
        await acquireLock(lockKey);
        await ensureMetadata(sessionDir, sessionId);

        const meta = await safeReadJSON(metadataPath);
        if (meta) {
          if (!meta.pageViews) meta.pageViews = [];
          if (!meta.journeyPath) meta.journeyPath = [];

          meta.pageViews.push({ path: data.path, timestamp: data.timestamp });

          // Build journey path (unique pages in order)
          if (!meta.journeyPath.includes(data.path)) {
            meta.journeyPath.push(data.path);
          }

          meta.updatedAt = new Date().toISOString();
          await safeWriteJSON(metadataPath, meta);
        }
      } catch (e) {
        console.error("Error updating pageview:", e);
      } finally {
        releaseLock(lockKey);
      }
    } else if (type === "events") {
      // Append events with locking to prevent race conditions
      const eventsPath = path.join(sessionDir, "events.json.gz");
      const eventsLockKey = `events_${sessionId}`;
      const metadataLockKey = `metadata_${sessionId}`;

      try {
        await acquireLock(eventsLockKey);
        let existingEvents = [];
        try {
          if (await fs.stat(eventsPath).catch(() => null)) {
            const compressedContent = await fs.readFile(eventsPath);
            if (compressedContent.length > 20 * 1024 * 1024) {
              // 20MB limit
              return NextResponse.json({
                success: false,
                error: "Recording size limit reached",
              });
            }
            const decompressedContent = await gunzip(compressedContent);
            existingEvents = JSON.parse(decompressedContent.toString());
          }
        } catch (e) {
          console.error(`Error reading existing events for ${sessionId}:`, e);
        }

        const allEvents = [...existingEvents, ...events];
        const newCompressedContent = await gzip(JSON.stringify(allEvents));

        // Atomic write for compressed file
        const tempEventsPath = `${eventsPath}.tmp`;
        await fs.writeFile(tempEventsPath, newCompressedContent);
        await fs.rename(tempEventsPath, eventsPath);

        // Update file size in metadata
        try {
          await acquireLock(metadataLockKey);
          await ensureMetadata(sessionDir, sessionId);
          const metadataPath = path.join(sessionDir, "metadata.json");
          const meta = await safeReadJSON(metadataPath);
          if (meta) {
            meta.fileSize = newCompressedContent.length;
            meta.updatedAt = new Date().toISOString();
            await safeWriteJSON(metadataPath, meta);
          }
        } catch (e) {
          console.error("Error updating file size in metadata:", e);
        } finally {
          releaseLock(metadataLockKey);
        }
      } catch (error) {
        console.error(
          `Error processing events for session ${sessionId}:`,
          error,
        );
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        );
      } finally {
        releaseLock(eventsLockKey);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "api/tracking",
      method: "POST",
      req: request,
    });
  }
}
