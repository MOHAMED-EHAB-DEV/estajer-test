import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();

    const user = await authHeaders(req);

    const chats = await Chat.find(
      {
        "participants.userId": user._id,
        "messages.state": "sent",
        // "messages.sender": { $ne: user._id },
      },
      {
        messages: { $elemMatch: { state: "sent" } },
        _id: 0,
      }
    );

    let unreadMessages = [];

    chats.forEach((chat) =>
      chat.messages.forEach((message) =>
        unreadMessages.push({ messageId: message._id })
      )
    );

    return NextResponse.json({ success: true, unreadMessages });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/chat/unread",
      method: "GET",
      req,
    });
  }
}
