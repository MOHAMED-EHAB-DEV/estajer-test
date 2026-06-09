import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import handleApiError from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";

const RECORDINGS_DIR = path.join(process.cwd(), ".cache", "recordings");
const RETENTION_DAYS = 60;

async function cleanupOldSessions() {
  try {
    const sessionDirs = await fs.readdir(RECORDINGS_DIR);
    const now = Date.now();
    const maxAge = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    for (const sessionId of sessionDirs) {
      const sessionPath = path.join(RECORDINGS_DIR, sessionId);
      const stats = await fs.stat(sessionPath);

      if (now - stats.mtimeMs > maxAge) {
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log(`Cleaned up old session: ${sessionId}`);
      }
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get("client");

    // Check if user is admin
    const user = client ? await authenticateUser() : await authHeaders(request);
    if (!user || user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run cleanup
    await cleanupOldSessions();

    // Get filter params
    const journeyFilter = searchParams.get("journey");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search")?.toLowerCase();
    const sizeFilter = searchParams.get("size");
    const deviceFilter = searchParams.get("device")?.toLowerCase();
    const browserFilter = searchParams.get("browser")?.toLowerCase();
    
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;

    const sessions = [];
    try {
      const sessionDirs = await fs.readdir(RECORDINGS_DIR);

      for (const sessionId of sessionDirs) {
        const metadataPath = path.join(
          RECORDINGS_DIR,
          sessionId,
          "metadata.json"
        );
        try {
          const metadataStr = await fs.readFile(metadataPath, "utf8");
          const metadata = JSON.parse(metadataStr);

          // Check if events file exists (either raw or compressed)
          const eventsPathRaw = path.join(
            RECORDINGS_DIR,
            sessionId,
            "events.json"
          );
          const eventsPathGz = path.join(
            RECORDINGS_DIR,
            sessionId,
            "events.json.gz"
          );

          const hasRaw = await fs
            .access(eventsPathRaw)
            .then(() => true)
            .catch(() => false);
          const hasGz = await fs
            .access(eventsPathGz)
            .then(() => true)
            .catch(() => false);
          const hasRecording = hasRaw || hasGz;

          // Apply filters
          let include = true;

          // Date filter
          if (dateFrom && metadata.startedAt) {
            const sessionDate = new Date(metadata.startedAt);
            if (sessionDate < new Date(dateFrom)) include = false;
          }
          if (dateTo && metadata.startedAt) {
            const sessionDate = new Date(metadata.startedAt);
            if (sessionDate > new Date(dateTo)) include = false;
          }

          // Journey filter
          if (journeyFilter && include) {
            const requiredPages = journeyFilter.split(",").map((p) => p.trim());
            const journeyPath = metadata.journeyPath || [];

            // Check if all required pages are in the journey in order
            let lastIndex = -1;
            for (const page of requiredPages) {
              const index = journeyPath.findIndex(
                (p, i) => i > lastIndex && p.includes(page)
              );
              if (index === -1) {
                include = false;
                break;
              }
              lastIndex = index;
            }
          }

          if (include && search) {
            const matchesSearch =
              metadata.sessionId?.toLowerCase().includes(search) ||
              metadata.visitorId?.toLowerCase().includes(search) ||
              metadata.ipAddress?.toLowerCase().includes(search) ||
              metadata.user?.fullName?.toLowerCase().includes(search) ||
              metadata.user?.email?.toLowerCase().includes(search) ||
              metadata.initialPath?.toLowerCase().includes(search) ||
              metadata.journeyPath?.some((p) => p.toLowerCase().includes(search));
            if (!matchesSearch) include = false;
          }

          if (include) {
            // Get actual file size if not in metadata
            let fileSize = metadata.fileSize;
            if (!fileSize && hasRecording) {
              try {
                const stats = await fs.stat(
                  hasGz ? eventsPathGz : eventsPathRaw
                );
                fileSize = stats.size;
              } catch (e) {
                fileSize = 0;
              }
            }

            if (sizeFilter) {
              const sizeKB = (fileSize || 0) / 1024;
              if (sizeFilter === "tiny" && sizeKB >= 50) include = false;
              if (sizeFilter === "small" && (sizeKB < 50 || sizeKB >= 250)) include = false;
              if (sizeFilter === "medium" && (sizeKB < 250 || sizeKB >= 1024)) include = false;
              if (sizeFilter === "large" && sizeKB < 1024) include = false;
            }

            if (include && deviceFilter) {
              const ua = metadata.userAgent || "";
              let device = "desktop";
              if (/mobile/i.test(ua)) device = "mobile";
              else if (/tablet|ipad/i.test(ua)) device = "tablet";
              if (device !== deviceFilter) include = false;
            }

            if (include && browserFilter) {
              const ua = metadata.userAgent || "";
              let browser = "other";
              if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "chrome";
              else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "safari";
              else if (ua.includes("Firefox")) browser = "firefox";
              else if (ua.includes("Edg")) browser = "edge";
              if (browser !== browserFilter) include = false;
            }

            if (include) {
              sessions.push({
                ...metadata,
                fileSize: fileSize || 0,
                hasRecording,
              });
            }
          }
        } catch (e) {
          // Skip if no metadata
        }
      }
    } catch (e) {
      // Directory might not exist yet
    }

    // Group sessions by visitorId
    const groupedSessions = sessions.reduce((acc, session) => {
      const visitorId = session.visitorId || "unknown";
      if (!acc[visitorId]) {
        acc[visitorId] = [];
      }
      acc[visitorId].push(session);
      return acc;
    }, {});

    const visitorGroups = Object.entries(groupedSessions)
      .map(([visitorId, groupSessions]) => {
        const sortedSessions = groupSessions.sort(
          (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
        );
        return {
          visitorId,
          sessions: sortedSessions,
          latestSession: sortedSessions[0],
          sessionCount: groupSessions.length,
        };
      })
      .sort((a, b) => new Date(b.latestSession.startedAt) - new Date(a.latestSession.startedAt));

    const totalGroups = visitorGroups.length;
    const totalPages = Math.ceil(totalGroups / limit) || 1;
    const skip = (page - 1) * limit;
    const paginatedGroups = visitorGroups.slice(skip, skip + limit);

    const withRecordings = sessions.filter(s => s.hasRecording).length;

    return NextResponse.json({
      success: true,
      data: paginatedGroups,
      pagination: {
        page,
        limit,
        total: totalGroups,
        pages: totalPages,
        totalSessions: sessions.length,
        withRecordings
      }
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "api/tracking/sessions",
      method: "GET",
      req: request,
    });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get("client");

    // Check if user is admin
    const user = client ? await authenticateUser() : await authHeaders(request);
    if (!user || user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const beforeDateStr = searchParams.get("beforeDate");

    if (!beforeDateStr) {
      return NextResponse.json(
        { error: "beforeDate parameter is required" },
        { status: 400 }
      );
    }

    const beforeDate = new Date(beforeDateStr);
    if (isNaN(beforeDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    try {
      const sessionDirs = await fs.readdir(RECORDINGS_DIR);

      for (const sessionId of sessionDirs) {
        const metadataPath = path.join(
          RECORDINGS_DIR,
          sessionId,
          "metadata.json"
        );
        try {
          const metadataStr = await fs.readFile(metadataPath, "utf8");
          const metadata = JSON.parse(metadataStr);

          if (metadata.startedAt) {
            const sessionDate = new Date(metadata.startedAt);
            if (sessionDate < beforeDate) {
              const sessionPath = path.join(RECORDINGS_DIR, sessionId);
              await fs.rm(sessionPath, { recursive: true, force: true });
              deletedCount++;
            }
          }
        } catch (e) {
          // If metadata is missing or unreadable, check the folder modification time as a fallback
          try {
            const sessionPath = path.join(RECORDINGS_DIR, sessionId);
            const stats = await fs.stat(sessionPath);
            if (stats.mtime < beforeDate) {
              await fs.rm(sessionPath, { recursive: true, force: true });
              deletedCount++;
            }
          } catch (statError) {
            // Skip if error
          }
        }
      }
    } catch (e) {
      // Directory might not exist or other error
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} sessions.`,
      deletedCount,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "api/tracking/sessions",
      method: "DELETE",
      req: request,
    });
  }
}
