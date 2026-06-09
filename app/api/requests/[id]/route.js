import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import Request from "@/models/Request";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

// Get a single request by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner") === "true";
    const lang = searchParams.get("lang");

    const excludeName = lang ? (lang === "en" ? "Ar" : "En") : "";
    const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";

    const request = await Request.findOne(
      {
        _id: id,
        ...(owner ? {} : { approved: true }),
      },
      {
        [`name${excludeName}`]: 0,
        [`address${excludeName}`]: 0,
        [`description${excludeName}`]: 0,
      }
    ).populate({
      path: "owner",
      select:
        "fullName email createdAt pathName avatar rating isOnline lastSeen",
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    const requestObj = request.toObject();
    const requestData = {
      ...requestObj,
      name: requestObj[`name${langSuffix}`],
      description: requestObj[`description${langSuffix}`],
      address: requestObj[`address${langSuffix}`],
    };

    // Remove all language-specific fields
    delete requestData[`name${langSuffix}`];
    delete requestData[`description${langSuffix}`];
    delete requestData[`address${langSuffix}`];

    return NextResponse.json({ success: true, data: requestData });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/requests/[id]",
      method: "GET",
      id,
      req,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;
    const data = await req.json();

    // Find the request and check ownership
    const request = await Request.findById(id);
    if (!request) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the request
    if (
      user.accountType !== "admin" &&
      request.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this request" },
        { status: 403 }
      );
    }

    // Handle image uploads if new images are provided
    let imageUrls = request.images || [];
    if (data.productImages && Array.isArray(data.productImages)) {
      // Filter out existing images (those with URLs) from new uploads (those with preview data URIs)
      const newImages = data.productImages.filter(
        (img) => img.preview && !img.preview.startsWith("http")
      );
      const existingImages = data.productImages
        .filter((img) => img.preview && img.preview.startsWith("http"))
        .map((img) => img.preview);

      // Upload new images
      if (newImages.length > 0) {
        const newImageUrls = await Promise.all(
          newImages.map((image) =>
            cloudinary.uploader
              .upload(image.preview, { folder: "requests" })
              .then((result) => result.secure_url)
          )
        );
        imageUrls = [...existingImages, ...newImageUrls];
      } else {
        imageUrls = existingImages;
      }
    }

    // Update request data
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        images: imageUrls,
        location: data.location
          ? {
              type: "Point",
              coordinates: [data.location.lng, data.location.lat],
            }
          : request.location,
        addressAr: data.addressAr || request.addressAr,
        addressEn: data.addressEn || request.addressEn,
        approved:
          data.approved !== undefined ? data.approved : request.approved,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/requests/[id]",
      method: "PATCH",
      id,
      req,
    });
  }
}

// Delete a request
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    // Find the request and check ownership
    const request = await Request.findById(id);
    if (!request) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the request
    if (
      user.accountType !== "admin" &&
      request.owner.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this request" },
        { status: 403 }
      );
    }

    // Delete the request
    await Request.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/requests/[id]",
      method: "DELETE",
      id,
      req,
    });
  }
}
