import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// POST - Mark a user note as seen
export async function POST(req, { params }) {
  const { noteId } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and update the specific note's seen status to true
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, "adminNotes._id": noteId },
      { $set: { "adminNotes.$.seen": true } },
      { new: true }
    ).select("-password -verificationCode");

    if (!updatedUser) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    const { noteId } = await params;
    return handleApiError(error, { endpoint: `/api/users/notes/${noteId}/seen`, method: "POST", req });
  }
}
