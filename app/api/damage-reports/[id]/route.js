import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DamageReport from "@/models/DamageReport";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch a specific damage report
export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await authHeaders(req);
    const { id } = await params;

    const damageReport = await DamageReport.findById(id);

    if (!damageReport) {
      return NextResponse.json(
        { success: false, error: "Damage report not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this report
    const isAdmin = user.accountType === "admin";
    const isReporter =
      damageReport.reporter._id.toString() === user._id.toString();
    const isCustomer =
      damageReport.customer._id.toString() === user._id.toString();

    if (!isAdmin && !isReporter && !isCustomer) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: damageReport,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/damage-reports/[id]",
      method: "GET",
      id,
      req,
    });
  }
}

// PATCH - Update damage report (admin only)
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { status, adminNotes } = await req.json();

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    if (status === "reviewed" || status === "resolved") {
      updateData.reviewedBy = user._id;
      updateData.reviewedAt = new Date();
    }

    const damageReport = await DamageReport.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!damageReport) {
      return NextResponse.json(
        { success: false, error: "Damage report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: damageReport,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/damage-reports/[id]",
      method: "PATCH",
      id,
      req,
    });
  }
}
