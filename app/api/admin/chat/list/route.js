import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authHeaders(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const chats = await Chat.find({})
      .populate("participants.userId", "fullName avatar isOnline lastSeen")
      .slice("messages", -1)
      .sort({ lastMessageAt: -1 })
      .limit(limit);

    return NextResponse.json(chats);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/chat/list",
      method: "GET",
      req,
    });
  }
}
