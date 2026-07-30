import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SupportChat from "@/models/SupportChat";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";
import { sendChatNotificationEmail } from "@/lib/email";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

async function requireAdmin(req) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  const user = client ? await authenticateUser() : await authHeaders(req);
  if (user.accountType !== "admin") throw new Error("Unauthorized");
  return user;
}

// GET — load full chat by userId
export async function GET(req) {
  try {
    await connectDB();
    await requireAdmin(req);


    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const chat = await SupportChat.findOne({ userId }).populate(
      "userId",
      "fullName avatar isOnline lastSeen email phone lang",
    );
    if (!chat) return NextResponse.json(null);

    const readMsgIds = [];
    if (chat.messages && chat.messages.length > 0) {
      chat.messages.forEach((m) => {
        if (m.role === "user" && m.state === "sent") {
          m.state = "read";
          readMsgIds.push(m._id.toString());
        }
      });
      if (readMsgIds.length > 0) {
        await chat.save();
      }
    }

    const chatObj = chat.toObject();
    chatObj.readMsgIds = readMsgIds;
    return NextResponse.json(chatObj);
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support",
      method: "GET",
      req,
    });
  }
}

// POST — admin sends a message
export async function POST(req) {
  try {
    await connectDB();
    await requireAdmin(req);

    const { userId, message } = await req.json();
    if (!userId || !message || message.length > 1000) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const chat = await SupportChat.findOne({ userId });
    if (!chat)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const adminMsg = {
      role: "admin",
      content: message,
      state: "sent",
      timestamp: new Date(),
    };
    chat.messages.push(adminMsg);
    chat.aiMode = false; // Admin takes over automatically
    chat.lastMessageAt = new Date();
    await chat.save();

    // Email user if still unread after 5 min
    const thisMessageAt = chat.lastMessageAt;
    setTimeout(async () => {
      try {
        const [updatedChat, recipient] = await Promise.all([
          SupportChat.findOne({ userId }),
          User.findById(userId, { email: 1, lang: 1, unsubscribed: 1 }),
        ]);
        if (!updatedChat || !recipient) return;
        if (updatedChat.lastMessageAt?.getTime() !== thisMessageAt?.getTime())
          return;
        const unread = updatedChat.messages.filter(
          (m) => m.role === "admin" && m.state === "sent",
        );
        if (unread.length === 0) return;
        await sendChatNotificationEmail(
          recipient.email,
          "Estajer Support",
          unread.length,
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`,
          recipient.lang || "ar",
          recipient.unsubscribed,
        );
      } catch (_) {}
    }, 5 * 60 * 1000);

    return NextResponse.json({
      message: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support",
      method: "POST",
      req,
    });
  }
}

// PATCH — toggle aiMode
export async function PATCH(req) {
  try {
    await connectDB();
    await requireAdmin(req);


    const { userId, aiMode } = await req.json();
    if (!userId || typeof aiMode !== "boolean") {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const chat = await SupportChat.findOneAndUpdate(
      { userId },
      { aiMode },
      { new: true },
    );
    if (!chat)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    return NextResponse.json({ success: true, aiMode: chat.aiMode });
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support",
      method: "PATCH",
      req,
    });
  }
}

// DELETE — delete a specific message
export async function DELETE(req) {
  try {
    await connectDB();
    await requireAdmin(req);


    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const messageId = searchParams.get("messageId");

    const chat = await SupportChat.findOne({ userId });
    if (!chat)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    chat.messages = chat.messages.filter(
      (m) => m._id.toString() !== messageId,
    );
    await chat.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support",
      method: "DELETE",
      req,
    });
  }
}
