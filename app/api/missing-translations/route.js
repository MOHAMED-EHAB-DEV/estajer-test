import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MissingTranslation from "@/models/MissingTranslation";

export async function POST(req) {
  try {
    const body = await req.json();
    const { key, pageUrl, lang, source, userAgent } = body || {};

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'key' field" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedKey = key.trim();
    const normalizedPage = pageUrl ? pageUrl.trim() : "/";
    const normalizedLang = lang ? lang.trim() : "ar";

    await MissingTranslation.findOneAndUpdate(
      { key: normalizedKey, pageUrl: normalizedPage, lang: normalizedLang },
      {
        $inc: { count: 1 },
        $set: {
          source: source || "client",
          userAgent: userAgent || "",
          lastSeen: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Error] missing-translations POST:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
