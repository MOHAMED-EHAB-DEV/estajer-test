import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

/**
 * Public endpoint to get user profiles for sitemap generation.
 * Returns only minimal data needed (pathName, updatedAt).
 */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 500;
    const forSitemap = searchParams.get("sitemap") === "true";

    if (forSitemap) {
      // Return only pathName and updatedAt for sitemap generation
      const users = await User.find(
        {
          pathName: { $exists: true, $ne: null, $ne: "" },
          isBanned: { $ne: true },
          $or: [
            { bioAr: { $exists: true, $ne: "" } },
            { bioEn: { $exists: true, $ne: "" } },
          ],
        },
        { pathName: 1, updatedAt: 1, _id: 1 },
      )
        .sort({ _id: -1 })
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        data: users,
      });
    }

    // Default: return unauthorized for non-sitemap requests
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 },
    );
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/profiles",
      method: "GET",
      req: request,
    });
  }
}
