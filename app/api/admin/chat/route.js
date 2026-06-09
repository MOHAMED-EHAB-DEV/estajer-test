import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

const ADMIN_NAME = "estajer";

export async function POST(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { chatId, message, isAdmin } = await request.json();

    if (!message || message.length > 500) {
      return NextResponse.json(
        { error: "Invalid message length" },
        { status: 400 }
      );
    }

    if (user.accountType !== "admin" && isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let chat = await Chat.findOne({ chatId });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const newMessage = {
      sender: user._id,
      content: message,
      state: "sent",
      isAdmin,
      timestamp: new Date(),
      notificationSent: false,
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();

    await chat.save();

    return NextResponse.json({
      chatId: chat.chatId,
      message: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/chat",
      method: "POST",
      req: request,
    });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    const messageId = searchParams.get("messageId");

    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Remove message from array
    chat.messages = chat.messages.filter((m) => m._id.toString() !== messageId);
    await chat.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/chat",
      method: "DELETE",
      req: request,
    });
  }
}
