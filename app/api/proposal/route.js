import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import Proposal from "@/models/Proposal";
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

    // Get proposals with pagination
    const [proposals, total] = await Promise.all([
      Proposal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Proposal.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: proposals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/proposal",
      method: "GET",
      req: request,
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
  maxDuration: 20,
};

import { updateAlert } from "@/lib/alert";

export async function POST(req) {
  try {
    await connectDB();
    const {
      name,
      email,
      phone,
      description,
      budget,
      pdfLink,
      proposalImages,
      title,
    } = await req.json();

    if (!proposalImages || !Array.isArray(proposalImages))
      return NextResponse.json(
        { error: "Invalid proposal images" },
        { status: 400 },
      );
    if (!name || !email || !phone || !description || !title)
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );

    // Upload Images to Cloudinary
    const images = await Promise.all(
      proposalImages.map(async (image) => {
        const uploaded = await cloudinary.uploader.upload(image.preview, {
          folder: "proposals",
          format: "webp",
        });
        return {
          preview: uploaded.secure_url,
          gradientColors: image.gradientColors,
          gradientStyle: image.gradientStyle,
        };
      }),
    );

    const proposal = await Proposal.create({
      name,
      email,
      phone,
      description,
      budget,
      images,
      pdfLink,
      title,
    });

    await updateAlert("proposal", proposal._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/proposal",
      method: "POST",
      req,
    });
  }
}
