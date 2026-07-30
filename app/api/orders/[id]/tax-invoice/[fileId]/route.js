import { NextResponse } from "next/server";
import { drive as googleDrive, auth } from "@googleapis/drive";
import { Readable } from "stream";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    await connectDB();
    let user;
    try {
      user = await authenticateUser();
    } catch (cookieErr) {
      try {
        user = await authHeaders(req);
      } catch (headerErr) {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 },
        );
      }
    }

    if (user.isBanned) {
      return NextResponse.json({ error: "User is banned" }, { status: 403 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isAdmin = user.accountType === "admin";
    const isOwner = order.ownerData?.toString() === user._id?.toString();
    const isCustomer = order.userData?.id?.toString() === user._id?.toString();

    if (!isCustomer && !isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse the file ID from the last segment of the URL pathname to avoid parameter key conflicts
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split("/");
    const fileId = pathnameParts[pathnameParts.length - 1];

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    // Setup OAuth2 Client
    const oauth2Client = new auth.OAuth2(
      process.env.GDRIVE_CLIENT_ID,
      process.env.GDRIVE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
    });

    const drive = googleDrive({ version: "v3", auth: oauth2Client });

    // Fetch file metadata
    const metadata = await drive.files.get({
      fileId: fileId,
      fields: "name, mimeType",
    });
    const { name, mimeType } = metadata.data;

    const isDownload = req.nextUrl.searchParams.get("download") === "true";
    const isRaw = req.nextUrl.searchParams.get("raw") === "true";

    // If it is a PDF, or if the request is for downloading or raw media stream:
    if (mimeType === "application/pdf" || isDownload || isRaw) {
      // Fetch file media stream from Google Drive
      const fileResponse = await drive.files.get(
        { fileId: fileId, alt: "media" },
        { responseType: "stream" },
      );

      const webStream = Readable.toWeb(fileResponse.data);

      return new Response(webStream, {
        headers: {
          "X-Robots-Tag": "noindex",
          "Content-Type": mimeType || "application/octet-stream",
          "Content-Disposition": isDownload
            ? `attachment; filename="${encodeURIComponent(name)}"`
            : `inline; filename="${encodeURIComponent(name)}"`,
        },
      });
    }

    // Otherwise, it's an image. Show it in the custom HTML viewer with a download button on the top right
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #09090b;
      color: #f4f4f5;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans select-none overflow-hidden">
  <header class="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 flex items-center justify-between z-10">
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium text-zinc-300 truncate max-w-xs sm:max-w-md">
        ${name}
      </span>
    </div>

    <div>
      <a
        href="?download=true"
        class="inline-flex items-center gap-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-semibold text-xs md:text-sm px-4 py-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Download</span>
      </a>
    </div>
  </header>

  <main class="flex-1 flex items-center justify-center p-4 overflow-auto">
    <div class="relative max-h-[85vh] max-w-full flex items-center justify-center">
      <img
        src="?raw=true"
        alt="${name}"
        class="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl border border-zinc-900 bg-zinc-900"
      />
    </div>
  </main>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error serving file from drive:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch file" },
      { status: 500 },
    );
  }
}
