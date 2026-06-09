import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch notes for an order
export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const order = await Order.findById(id)
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/orders/${id}/notes`, method: "GET", req });
  }
}

// POST - Add a new note
export async function POST(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { note } = await req.json();
    if (!note?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $push: {
          adminNotes: {
            userId: user._id,
            note: note.trim(),
            addedAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/orders/${id}/notes`, method: "POST", req });
  }
}

// PATCH - Edit an existing note
export async function PATCH(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { noteId, note } = await req.json();
    if (!noteId || !note?.trim()) {
      return NextResponse.json({ error: "Note ID and content are required" }, { status: 400 });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, "adminNotes._id": noteId, "adminNotes.userId": user._id },
      { $set: { "adminNotes.$.note": note.trim() } },
      { new: true }
    )
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!order) {
      return NextResponse.json(
        { error: "Order or note not found, or you don't own this note" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/orders/${id}/notes`, method: "PATCH", req });
  }
}

// DELETE - Remove a note
export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // Admins can delete any note; note owners can only delete their own
    const filter = { _id: id };
    const noteFilter = { _id: noteId };
    // Non-super-admin: only own notes (here all admins treated equally, adjust if needed)

    const order = await Order.findByIdAndUpdate(
      id,
      { $pull: { adminNotes: { _id: noteId } } },
      { new: true }
    )
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/orders/${id}/notes`, method: "DELETE", req });
  }
}
