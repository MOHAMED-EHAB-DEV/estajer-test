import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authHeaders(req);

    const chats = await Chat.find({
      "participants.userId": user._id,
    })
      .populate("participants.userId", "fullName avatar isOnline lastSeen")
      .slice("messages", -1)
      .sort({ lastMessageAt: -1 });
    return NextResponse.json(chats);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/chat/list",
      method: "GET",
      req,
    });
  }
}
