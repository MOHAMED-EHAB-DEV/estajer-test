import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AiChat from "@/models/AiChat";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const chat = await AiChat.findOne({ sessionId }).populate(
      "user",
      "fullName avatar isOnline lastSeen"
    );

    if (!chat) {
      return NextResponse.json([]);
    }

    return NextResponse.json(chat);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/aichat",
      method: "GET",
      req: request,
    });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { chatId, message, isAdmin } = await request.json();
    console.log("isAdmin: ", isAdmin);

    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!message || message.length > 500) {
      return NextResponse.json(
        { error: "Invalid message length" },
        { status: 400 }
      );
    }

    const chat = await AiChat.findOne({ sessionId: chatId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const newMessage = {
      role: "assistant",
      content: message,
      isAdmin: isAdmin,
      timestamp: new Date(),
      state: "read",
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json({
      sessionId: chat.sessionId,
      message: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/aichat",
      method: "POST",
      req: request,
    });
  }
}
