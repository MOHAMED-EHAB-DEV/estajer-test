import connectDB from "@/lib/db";
import Shop from "@/models/Shop";
import { NextResponse } from "next/server";

// Public endpoint — no auth needed.
// GET /api/shops/domain?domain=alaaelbana.com
// Returns { slug } if found, { slug: null } if not.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain")?.toLowerCase().trim();
    if (!domain) return NextResponse.json({ slug: null }, { status: 400 });
    await connectDB();
    const shop = await Shop.findOne({ domain, isActive: true })
      .select("slug")
      .lean();
    return NextResponse.json({ slug: shop?.slug || null });
  } catch {
    return NextResponse.json({ slug: null }, { status: 500 });
  }
}
