import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ErrorLog from "@/models/ErrorLog";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";

// GET - Fetch single error log details
export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = req.headers.get("authorization")
      ? await authHeaders(req)
      : await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const errorLog = await ErrorLog.findById(id).populate(
      "userId",
      "fullName email avatar"
    );

    if (!errorLog) {
      return NextResponse.json(
        { success: false, error: "Error log not found" },
        { status: 404 }
      );
    }

    // Get similar errors (same message)
    const similarErrors = await ErrorLog.find({
      message: errorLog.message,
      _id: { $ne: errorLog._id },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("createdAt endpoint method statusCode userId")
      .populate("userId", "fullName email");

    return NextResponse.json({
      success: true,
      data: errorLog,
      similarErrors,
      similarCount: await ErrorLog.countDocuments({
        message: errorLog.message,
      }),
    });
  } catch (error) {
    console.error("Error fetching error log:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update single error log
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { resolved, notes } = await req.json();

    const updateData = {};
    if (resolved !== undefined) updateData.resolved = resolved;
    if (notes !== undefined) updateData.notes = notes;

    const errorLog = await ErrorLog.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!errorLog) {
      return NextResponse.json(
        { success: false, error: "Error log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: errorLog,
    });
  } catch (error) {
    console.error("Error updating error log:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete single error log
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const errorLog = await ErrorLog.findByIdAndDelete(id);

    if (!errorLog) {
      return NextResponse.json(
        { success: false, error: "Error log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Error log deleted",
    });
  } catch (error) {
    console.error("Error deleting error log:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
