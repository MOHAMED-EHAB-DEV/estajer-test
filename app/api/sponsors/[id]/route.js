import { NextResponse } from "next/server";
import Sponsor from "@/models/Sponsor";
import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch single sponsor
export async function GET(request, { params }) {
  try {
    await connectDB();

    const sponsor = await Sponsor.findById(params.id).populate(
      "user",
      "name email avatar shopName shopDescription"
    );

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/sponsors/[id]",
      method: "GET",
      id,
      req: request,
    });
  }
}

// PATCH - Update sponsor
export async function PATCH(request, { params }) {
  try {
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { category, isActive, priority, sponsorshipEndDate } = body;

    const sponsor = await Sponsor.findById(params.id);
    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (category !== undefined) sponsor.category = category;
    if (isActive !== undefined) sponsor.isActive = isActive;
    if (priority !== undefined) sponsor.priority = priority;
    if (sponsorshipEndDate !== undefined)
      sponsor.sponsorshipEndDate = sponsorshipEndDate;

    await sponsor.save();
    await sponsor.populate(
      "user",
      "name email avatar shopName shopDescription"
    );

    return NextResponse.json({
      success: true,
      data: sponsor,
      message: "Sponsor updated successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/sponsors/[id]",
      method: "PATCH",
      id,
      req: request,
    });
  }
}

// DELETE - Remove sponsor
export async function DELETE(request, { params }) {
  try {
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const sponsor = await Sponsor.findById(params.id);
    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      );
    }

    await Sponsor.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Sponsor removed successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/sponsors/[id]",
      method: "DELETE",
      id,
      req: request,
    });
  }
}
