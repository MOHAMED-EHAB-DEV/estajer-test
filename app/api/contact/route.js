import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  try {
    await connectDB();
    const user = await authenticateUser();

    // Check if user is admin
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate("user", "fullName email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Contact.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/contact",
      method: "GET",
      req: request,
    });
  }
}

import { updateAlert } from "@/lib/alert";
import Visitor from "@/models/Visitor";

export async function POST(request) {
  try {
    await connectDB();

    let user = null;
    try {
      user = await authenticateUser();
    } catch (_) {
      user = null;
    }

    const {
      name,
      email,
      subject,
      message,
      phone,
      contactImages,
      lang,
      visitorId,
    } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    let images;

    if (contactImages && contactImages.length > 0) {
      images = await Promise.all(
        contactImages.map(async (image) => {
          const uploaded = await cloudinary.uploader.upload(image.preview, {
            folder: "contacts",
            format: "webp",
          });
          return {
            preview: uploaded.secure_url,
            gradientColors: image.gradientColors,
            gradientStyle: image.gradientStyle,
          };
        }),
      );
    }

    // Store contact form submission in database
    const contactSubmission = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      lang,
      image: images && images.length > 0 ? images[0] : null,
      user: user?._id || null,
      visitorId: !user ? visitorId : null,
    });
    await updateAlert("contact", contactSubmission._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/contact",
      method: "POST",
      req: request,
    });
  }
}
