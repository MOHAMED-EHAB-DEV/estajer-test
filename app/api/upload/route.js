import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    const user = await authenticateUser();
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadedImage = await cloudinary.uploader.upload(fileBase64, {
      folder: "blog-content",
      format: "webp",
    });

    return NextResponse.json({ success: true, url: uploadedImage.secure_url });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/upload",
      method: "POST",
      req,
    });
  }
}
