import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// GET - Fetch notes for a user
export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const targetUser = await User.findById(id)
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: targetUser.adminNotes || [] });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/users/${id}/notes`, method: "GET", req });
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

    const targetUser = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          adminNotes: {
            userId: user._id,
            note: note.trim(),
            addedAt: new Date(),
            seen: false,
          },
        },
      },
      { new: true }
    )
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: targetUser.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/users/${id}/notes`, method: "POST", req });
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

    const targetUser = await User.findOneAndUpdate(
      { _id: id, "adminNotes._id": noteId, "adminNotes.userId": user._id },
      { $set: { "adminNotes.$.note": note.trim() } },
      { new: true }
    )
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!targetUser) {
      return NextResponse.json(
        { error: "User or note not found, or you don't own this note" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: targetUser.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/users/${id}/notes`, method: "PATCH", req });
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

    const targetUser = await User.findByIdAndUpdate(
      id,
      { $pull: { adminNotes: { _id: noteId } } },
      { new: true }
    )
      .select("adminNotes")
      .populate("adminNotes.userId", "fullName avatar");

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: targetUser.adminNotes });
  } catch (error) {
    return handleApiError(error, { endpoint: `/api/users/${id}/notes`, method: "DELETE", req });
  }
}
