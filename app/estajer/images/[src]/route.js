import { NextResponse } from "next/server";
import sharp from "sharp";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import handleApiError from "@/lib/errorHandler";
import { drive as googleDrive, auth } from "@googleapis/drive";
import { Readable } from "stream";

// export const dynamic = "force-static";

// Cache directory paths
const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const ORIGINAL_CACHE_DIR = path.join(CACHE_DIR, "original");

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(ORIGINAL_CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create cache directory:", error);
  }
}

// Sanitize src for safe filename usage
function sanitizeSrc(src) {
  return src.replace(/[^a-zA-Z0-9_-]/g, "_");
}

// Generate cache filename based on parameters
function getCacheFilename(src, width, quality, aspectRatio, crop) {
  const sanitizedSrc = sanitizeSrc(src);
  const arPart = aspectRatio ? `_ar-${aspectRatio.replace(":", "-")}` : "";
  const cropPart = crop ? "_crop-true" : "";
  return `${sanitizedSrc}_w-${width}_q-${quality}${arPart}${cropPart}.webp`;
}

export async function GET(request, { params }) {
  const src = (await params)?.src;
  if (src.includes("_params_")) {
    let newSrc;
    try {
      const srcArr = src.split("_params_");
      const paramsStr = srcArr[1];

      // Parse parameters
      const width = paramsStr.match(/w=(\d+)/)?.[1];
      const quality = paramsStr.match(/q=(\d+)/)?.[1];
      const aspectRatio = paramsStr.match(/ar=([^_]+)/)?.[1];
      const encodedSrc = encodeURIComponent(srcArr[0]);
      const getImageId = (encodedUrl) => {
        const decodedUrl = decodeURIComponent(encodedUrl);
        const match = decodedUrl.match(/\/upload\/v\d+\/(.+)\.\w+$/);
        return match ? match[1].split("/").join("%2F") : encodedUrl;
      };
      newSrc = `https://assets.estajer.com/estajer/images/${getImageId(encodedSrc)}?w=${width}&q=${quality}${
        aspectRatio ? `&ar=${aspectRatio}` : ""
      }`;
    } catch (error) {
      console.error("Error parsing parameters:", error);
    }

    try {
      const checkRes = await fetch(newSrc, { method: "HEAD" });
      if (!checkRes.ok) {
        return new Response(null, {
          status: 410,
          headers: { "Cache-Control": "public, max-age=31536000, immutable" },
        });
      }
    } catch (checkErr) {
      console.error("Failed to verify image existence:", checkErr);
    }

    const redirectResponse = NextResponse.redirect(newSrc, { status: 301 });
    redirectResponse.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    redirectResponse.headers.set("X-Robots-Tag", "noindex, follow");
    redirectResponse.headers.set("Link", `<${newSrc}>; rel="canonical"`);
    return redirectResponse;
  }
  try {
    // Parse URL search parameters
    const { searchParams } = new URL(request.url);
    const width = parseInt(searchParams.get("w")) || 1000;
    const quality = parseInt(searchParams.get("q")) || 80;
    const aspectRatio = searchParams.get("ar");
    const crop = searchParams.get("crop") === "true";

    // Decode the src parameter
    const decodedSrc = decodeURIComponent(src);

    // Validate URL - only allow Cloudinary URLs for external sources
    if (
      decodedSrc.startsWith("https:") &&
      !decodedSrc.includes("res.cloudinary.com")
    ) {
      return NextResponse.json(
        { message: "Invalid image source. Only Cloudinary URLs are allowed." },
        { status: 400 },
      );
    }

    // Generate cache filename
    const cacheFilename = getCacheFilename(
      decodedSrc,
      width,
      quality,
      aspectRatio,
      crop,
    );
    const cachePath = path.join(CACHE_DIR, cacheFilename);

    // Check if cached file exists
    try {
      const cachedImage = await fs.readFile(cachePath);
      if (process.env.NODE_ENV === "production") {
        const stats = await fs.stat(cachePath).catch(() => null);
        const isOlderThan5Min = stats
          ? Date.now() - stats.mtimeMs > 5 * 60 * 1000
          : true;
        if (isOlderThan5Min) {
          console.log(
            "⚠️ Served from Node.js (Nginx should have caught this):",
            cacheFilename,
            `- URL: ${request.url}`,
          );
        }
      }
      return new Response(cachedImage, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control":
            "public, max-age=31536000, s-maxage=31536000, immutable",
          ETag: `"${generateETag(cachedImage)}"`,
          "X-Cache": "HIT",
        },
      });
    } catch (_) {}

    // Ensure cache directory exists
    await ensureCacheDir();

    // Process the image
    const processedImageBuffer = await downloadAndProcessImage({
      aspectRatio,
      src: decodedSrc,
      quality,
      width,
      crop,
    });

    // Save to cache
    try {
      await fs.writeFile(cachePath, processedImageBuffer);
      // FIX STARTS HERE: Explicitly set permission so Nginx can read it
      await fs.chmod(cachePath, 0o644);
    } catch (error) {
      console.error("Failed to cache image:", error);
    }

    return new Response(processedImageBuffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control":
          "public, max-age=31536000, s-maxage=31536000, immutable",
        "X-Robots-Tag": "noindex",
        ETag: `"${generateETag(processedImageBuffer)}"`,
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch image: 404")) {
      return new Response(null, {
        status: 410,
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
    const src = (await params).src;
    console.error("Image processing error:", src, error);
    return handleApiError(error, {
      endpoint: "estajer/images/[src]",
      method: "GET",
      req: request,
      id: src,
    });
  }
}

async function downloadAndProcessImage({
  src,
  width = 1000,
  quality = 80,
  aspectRatio,
  crop,
}) {
  const sanitizedSrc = sanitizeSrc(src);
  const originalFilename = `${sanitizedSrc}.webp`;
  const originalPath = path.join(ORIGINAL_CACHE_DIR, originalFilename);

  let buffer;

  // Try to load original from cache first
  try {
    buffer = await fs.readFile(originalPath);
  } catch (e) {
    // If not in cache, download it
    const imageUrl = src.includes("https")
      ? src
      : `https://res.cloudinary.com/dhfzkadm2/image/upload/${src}.webp`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    buffer = Buffer.from(imageBuffer);

    // Save original image to cache folder
    try {
      await fs.writeFile(originalPath, buffer);
      await fs.chmod(originalPath, 0o644);
      if (process.env.NODE_ENV === "production") {
        Promise.resolve()
          .then(() => uploadOriginalToDrive(buffer, originalFilename))
          .catch((err) => console.error("Background Drive upload error:", err));
      }
    } catch (saveError) {
      console.error("Failed to save original image cache:", saveError);
    }
  }

  // Get metadata
  const metadata = await sharp(buffer).metadata();
  const srcWidth = metadata.width || width;
  const srcHeight = metadata.height || width;

  if (aspectRatio) {
    const [ratioW, ratioH] = aspectRatio.split(":").map(Number);

    const targetWidth = Math.min(width, srcWidth);
    const targetHeight = Math.round(targetWidth * (ratioH / ratioW));

    if (crop) {
      return await sharp(buffer)
        .resize(targetWidth, targetHeight, {
          fit: "cover",
          position: "center", // Crop from center
        })
        .webp({ quality })
        .toBuffer();
    }

    // Resize image maintaining aspect ratio
    const resizedImage = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const resizedMetadata = await sharp(resizedImage).metadata();
    const rW = resizedMetadata.width || 0;
    const rH = resizedMetadata.height || 0;

    const padTop = Math.max(0, Math.floor((targetHeight - rH) / 2));
    const padBottom = Math.max(0, targetHeight - rH - padTop);
    const padLeft = Math.max(0, Math.floor((targetWidth - rW) / 2));
    const padRight = Math.max(0, targetWidth - rW - padLeft);

    return await sharp(resizedImage)
      .ensureAlpha()
      .extend({
        top: padTop,
        bottom: padBottom,
        left: padLeft,
        right: padRight,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality })
      .toBuffer();
  }

  const targetWidth = Math.min(width, srcWidth);

  const resizedImageBuffer = await sharp(buffer)
    .resize(targetWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  return resizedImageBuffer;
}

function generateETag(buffer) {
  return createHash("md5").update(buffer).digest("hex").slice(0, 16);
}

// Helper for Background Upload
async function uploadOriginalToDrive(buffer, fileName) {
  if (
    !process.env.GDRIVE_CLIENT_ID ||
    !process.env.GDRIVE_CLIENT_SECRET ||
    !process.env.GDRIVE_REFRESH_TOKEN ||
    !process.env.GDRIVE_IMAGES_FOLDER_ID
  ) {
    return;
  }
  try {
    const oauth2Client = new auth.OAuth2(
      process.env.GDRIVE_CLIENT_ID,
      process.env.GDRIVE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
    });

    const drive = googleDrive({ version: "v3", auth: oauth2Client });

    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GDRIVE_IMAGES_FOLDER_ID],
      },
      media: {
        mimeType: "image/webp",
        body: Readable.from(buffer),
      },
    });
  } catch (error) {
    console.error("[Google Drive Archive] Upload failed:", error.message);
  }
}
