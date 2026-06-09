import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Visitor from "@/models/Visitor";

export async function GET(req) {
  try {
    await connectDB();

    const headers = req.headers;
    const forwarded =
      headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
    const ip = forwarded
      ? forwarded.split(",")[0].trim().replace("::ffff:", "")
      : undefined;
    const userAgent = headers.get("user-agent") || "";
    // const referrer = headers.get("referer") || "";
    const acceptLanguage = headers.get("accept-language") || "";
    const { pathname } = new URL(req.url);

    let visitor = await Visitor.findOne({ ip });
    if (!visitor) {
      visitor = await Visitor.create({
        ip,
        userAgent,
        // referrer,
        path: pathname,
        acceptLanguage,
      });
    }

    return NextResponse.json({ success: true, id: visitor._id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 200 }
    );
  }
}
