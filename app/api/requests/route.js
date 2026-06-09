import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import Request from "@/models/Request";
import { NextResponse } from "next/server";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const data = await req.json();

    // Upload images to cloudinary if provided
    let imageUrls = [];
    if (
      data.productImages &&
      Array.isArray(data.productImages) &&
      data.productImages.length > 0
    ) {
      imageUrls = await Promise.all(
        data.productImages.map((image) =>
          cloudinary.uploader
            .upload(image.preview, { folder: "requests" })
            .then((result) => result.secure_url)
        )
      );
    }

    const request = await Request.create({
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
      images: imageUrls,
      location: {
        type: "Point",
        coordinates: [data.location.lng, data.location.lat],
      },
      addressAr: data.addressAr,
      addressEn: data.addressEn,
      owner: user._id,
      approved: false,
    });

    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/requests",
      method: "POST",
      req,
      requestBody: data,
    });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const token = req.headers.get("authorization");
    const user = token ? await authHeaders(req) : null;

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const showAll = searchParams.get("showAll") === "true";
    const approved = searchParams.get("approved");
    const rejected = searchParams.get("rejected");
    const lang = searchParams.get("lang");
    const userId = searchParams.get("userId");
    const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";
    const excludeName = lang ? (lang === "en" ? "Ar" : "En") : "";

    let query = {};

    // If userId is provided, show all requests (approved or not) for that user
    if (user && user.accountType !== "admin") query.owner = user.id;

    if (userId) query.owner = userId;

    if (!showAll) query.approved = true;

    if (approved) query.approved = approved === "true";

    if (rejected) query.rejected = rejected === "true";

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(query, {
        [`name${excludeName}`]: 0,
        [`address${excludeName}`]: 0,
        [`description${excludeName}`]: 0,
      })
        .populate("owner", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Request.countDocuments(query),
    ]);
    if (lang && requests.length > 0) {
      requests.forEach((request) => {
        request.name = request[`name${langSuffix}`];
        delete request[`name${langSuffix}`];
        request.description = request[`description${langSuffix}`];
        delete request[`description${langSuffix}`];
        request.address = request[`address${langSuffix}`];
        delete request[`address${langSuffix}`];
      });
    }
    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/requests",
      method: "GET",
      req,
    });
  }
}
