import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import McpAuthCode from "@/models/McpAuthCode";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const auth_code = formData.get("auth_code");

    if (!file || !auth_code) {
      return NextResponse.json(
        { error: "Missing file or auth_code" },
        { status: 400 }
      );
    }

    // 1. Verify the MCP Auth Code
    await connectDB();
    const record = await McpAuthCode.findOne({ code: auth_code });
    if (!record || !record.used || !record.userId) {
      return NextResponse.json(
        { error: "Unauthorized or invalid auth_code" },
        { status: 401 }
      );
    }

    // 2. Convert the uploaded file to a format Cloudinary accepts (base64 URI)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    // 3. Upload to Cloudinary securely on the server
    const uploaded = await cloudinary.uploader.upload(base64Image, {
      folder: "products/mcp_uploads",
      format: "webp",
      transformation: [
        { width: 1500, height: 1500, crop: "limit" }
      ]
    });

    // 4. Return the public URL
    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,
    });
  } catch (error) {
    console.error("Direct Upload Error:", error);
    return NextResponse.json(
      { error: "Server error during upload" },
      { status: 500 }
    );
  }
}
