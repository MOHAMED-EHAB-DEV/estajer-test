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
      "fullName avatar isOnline lastSeen phone email"
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

export async function DELETE(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const messageId = searchParams.get("messageId");

    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const chat = await AiChat.findOne({ sessionId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Remove message from array
    chat.messages = chat.messages.filter((m) => m._id.toString() !== messageId);
    await chat.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/aichat",
      method: "DELETE",
      req: request,
    });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { sessionId, action } = await request.json();
    if (!sessionId || !["ban", "unban"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const chat = await AiChat.findOne({ sessionId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (action === "ban") {
      chat.spamCount = 3;
    } else {
      chat.spamCount = 0;
    }

    await chat.save();
    return NextResponse.json({ success: true, spamCount: chat.spamCount });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/aichat",
      method: "PATCH",
      req: request,
    });
  }
}

