import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import Notification from "@/models/Notification";
import { authenticateUser } from "@/middleware/auth";
import User from "@/models/User";
import { sendChatNotificationEmail } from "@/lib/email";
import sendNotifications from "@/lib/sendNotification";
import { handleApiError } from "@/lib/errorHandler";

import { updateAlert } from "@/lib/alert";

export async function POST(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { otherUserId, message, aiData } = await request.json();

    if (
      message === undefined ||
      message === null ||
      message.length > 500 ||
      (!message && !aiData)
    ) {
      return NextResponse.json(
        { error: "Invalid message length" },
        { status: 400 },
      );
    }

    const chatId = [user._id.toString(), otherUserId].sort().join("_");
    let chat = await Chat.findOne({ chatId });

    if (!chat) {
      chat = new Chat({
        chatId,
        participants: [{ userId: user._id }, { userId: otherUserId }],
        messages: [],
      });
    }

    chat.messages.push({
      sender: user._id,
      content: message || "",
      state: "sent",
      timestamp: new Date(),
      notificationSent: false,
      aiData,
    });
    chat.lastMessageAt = new Date();

    await chat.save();
    await updateAlert("message", chat._id);

    // Snapshot the timestamp of THIS message — used to debounce rapid sends
    const thisMessageAt = chat.lastMessageAt;

    // --- Push notification: 20s after message if still unread
    setTimeout(async () => {
      try {
        const [updatedChat, { lang }] = await Promise.all([
          Chat.findOne({ chatId }),
          User.findById(otherUserId, { lang: 1 }),
        ]);
        if (!updatedChat) return;
        // Another message was sent after this one — let that timer handle it
        if (updatedChat.lastMessageAt?.getTime() !== thisMessageAt?.getTime())
          return;
        const unread = updatedChat.messages.filter((m) => m.state === "sent");
        if (unread.length === 0) return; // already read
        const notificationTitle =
          lang === "en"
            ? `You have ${unread.length} new messages from ${user.fullName}`
            : `لديك ${unread.length} رسائل جديدة من ${user.fullName}`;
        const payload = {
          title:
            lang === "en"
              ? "You have new messages in your inbox."
              : "لديك رسالة جديدة",
          body: notificationTitle,
          data: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages?chatId=${chat.chatId}`,
          },
          actions: [
            {
              action: "open",
              title: lang === "en" ? "Open Chat" : "عرض الرسائل",
            },
            { action: "dismiss", title: lang === "en" ? "Dismiss" : "إلغاء" },
          ],
        };
        await sendNotifications({ id: otherUserId, payload });
      } catch (err) {
        console.error("Push notification (20s) error:", err);
      }
    }, 5 * 1000); // 20 seconds

    // --- Email + DB notification: 5 min after message if still unread ---
    setTimeout(
      async () => {
        const [updatedChat, { email, lang, unsubscribed }] = await Promise.all([
          Chat.findOne({ chatId, "messages.state": "sent" }),
          User.findById(otherUserId, { email: 1, lang: 1, unsubscribed: 1 }),
        ]);

        if (updatedChat) {
          const unreadMessages = updatedChat.messages.filter(
            (m) => m.state === "sent",
          );
          if (unreadMessages.length > 0) {
            let notificationTitle;
            if (lang === "en") {
              notificationTitle = `You have ${unreadMessages.length} new messages from ${user.fullName}`;
            } else {
              notificationTitle = `لديك ${unreadMessages.length} رسائل جديدة من ${user.fullName}`;
            }

            const lastNotification = await Notification.findOne({
              user: otherUserId,
              type: "message",
              relatedId: chat._id,
              seen: false,
            });
            if (lastNotification) {
              lastNotification.set({ title: notificationTitle });
              await lastNotification.save();
            } else {
              await Notification.create({
                user: otherUserId,
                title: notificationTitle,
                type: "message",
                relatedId: chat._id,
              });
              await sendChatNotificationEmail(
                email,
                user.fullName,
                unreadMessages.length,
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`,
                lang || "ar",
                unsubscribed,
              );
            }
          }
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return NextResponse.json({
      chatId: chat.chatId,
      message: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/chat",
      method: "POST",
      req: request,
    });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    const chat = await Chat.findOne({ chatId })
      .populate("participants.userId", "fullName avatar isOnline lastSeen")
      .populate("messages.sender", "fullName");

    if (!chat) {
      return NextResponse.json([]);
    }

    if (
      !chat.participants.some(
        (p) => p.userId?._id?.toString() === user._id.toString(),
      ) &&
      user.accountType !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/chat",
      method: "GET",
      req: request,
    });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { chatId, messageIds } = await request.json();

    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await Chat.updateOne(
      { chatId },
      { $set: { "messages.$[elem].state": "read" } },
      {
        arrayFilters: [
          { "elem._id": { $in: messageIds }, "elem.sender": { $ne: user._id } },
        ],
      },
    );

    // Mark admin messages as read
    await Chat.updateOne(
      { chatId },
      { $set: { "messages.$[elem].state": "read" } },
      {
        arrayFilters: [
          { "elem._id": { $in: messageIds }, "elem.isAdmin": true },
        ],
      },
    );

    // Delete notifications for this chat since messages are read
    await Notification.deleteMany({
      user: user._id,
      type: "message",
      relatedId: chat._id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/chat",
      method: "PATCH",
      req: request,
    });
  }
}
