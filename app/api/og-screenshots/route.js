/**
 * API Route: GET /api/og-screenshots
 *
 * Triggers server-side OG screenshot capture for all key pages.
 * Uses Puppeteer + Sharp to produce 1200×630 WebP images saved to public/og/
 *
 * Protected by CRON_SECRET header to prevent abuse.
 * Intended to be called:
 *   - Manually: GET /api/og-screenshots?secret=<CRON_SECRET>
 *   - After deployments via CI/CD webhook
 *   - From cron/scheduler
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PUBLIC_OG_DIR = path.join(process.cwd(), "public", "og");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Pages to capture — add/remove as needed
const PAGES = [
  { name: "home_ar", path: "/" },
  { name: "home_en", path: "/en" },
  { name: "about_ar", path: "/ar/about" },
  { name: "about_en", path: "/en/about" },
  { name: "shops_ar", path: "/ar/shops" },
  { name: "shops_en", path: "/en/shops" },
  { name: "contact_ar", path: "/ar/contact" },
  { name: "contact_en", path: "/en/contact" },
  { name: "login_ar", path: "/ar/login" },
  { name: "login_en", path: "/en/login" },
  { name: "register_ar", path: "/ar/register" },
  { name: "register_en", path: "/en/register" },
  { name: "pricing_ar", path: "/ar/pricing" },
  { name: "pricing_en", path: "/en/pricing" },
  { name: "rental_store_ar", path: "/ar/rental-store" },
  { name: "rental_store_en", path: "/en/rental-store" },
  { name: "faq_ar", path: "/ar/faq" },
  { name: "faq_en", path: "/en/faq" },
  { name: "blogs_ar", path: "/ar/blogs" },
  { name: "blogs_en", path: "/en/blogs" },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function capturePageScreenshot(browser, baseUrl, pageConfig) {
  const page = await browser.newPage();

  await page.setViewport({ width: OG_WIDTH, height: OG_HEIGHT });

  // Suppress auth state to avoid redirects
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      },
    });
  });

  try {
    await page.goto(`${baseUrl}${pageConfig.path}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Allow above-fold content to fully render
    await new Promise((r) => setTimeout(r, 1500));

    const pngBuffer = await page.screenshot({
      clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT },
      type: "png",
    });

    return pngBuffer;
  } finally {
    await page.close();
  }
}

export async function GET(request) {
  // Auth check
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Dynamically import Puppeteer + Sharp (heavy deps, lazy load)
  let puppeteer, sharp;
  try {
    [{ default: puppeteer }, { default: sharp }] = await Promise.all([
      import("puppeteer"),
      import("sharp"),
    ]);
  } catch (e) {
    return NextResponse.json(
      {
        error: "puppeteer or sharp not installed",
        hint: "Run: npm install -D puppeteer",
        details: e.message,
      },
      { status: 500 },
    );
  }

  await ensureDir(PUBLIC_OG_DIR);

  // Determine base URL
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const results = [];
  const startTime = Date.now();

  try {
    for (const pageConfig of PAGES) {
      const outputPath = path.join(PUBLIC_OG_DIR, `${pageConfig.name}.webp`);

      try {
        const pngBuffer = await capturePageScreenshot(browser, baseUrl, pageConfig);

        // Convert PNG → WebP
        await sharp(pngBuffer)
          .webp({ quality: 85, effort: 4 })
          .toFile(outputPath);

        const stat = await fs.stat(outputPath);

        results.push({
          name: pageConfig.name,
          status: "ok",
          url: `/og/${pageConfig.name}.webp`,
          sizeKB: Math.round(stat.size / 1024),
        });
      } catch (err) {
        console.error(`[OG] Failed: ${pageConfig.name}`, err.message);
        results.push({
          name: pageConfig.name,
          status: "error",
          error: err.message,
        });
      }
    }
  } finally {
    await browser.close();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const successful = results.filter((r) => r.status === "ok").length;

  return NextResponse.json({
    success: true,
    captured: successful,
    total: PAGES.length,
    elapsed: `${elapsed}s`,
    results,
  });
}
