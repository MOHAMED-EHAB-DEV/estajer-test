import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const user = client ? await authenticateUser() : await authHeaders(req);

    const pipeline = [
      { $match: { "participants.userId": user._id } },
      {
        $lookup: {
          from: "users",
          localField: "participants.userId",
          foreignField: "_id",
          as: "participantUsers",
        },
      },
    ];

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      pipeline.push({
        $match: {
          participantUsers: {
            $elemMatch: {
              _id: { $ne: user._id },
              $or: [{ fullName: regex }, { email: regex }, { phone: regex }],
            },
          },
        },
      });
    }

    pipeline.push(
      { $sort: { lastMessageAt: -1, updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          chatId: 1,
          participants: 1,
          messages: { $slice: ["$messages", -1] },
          lastMessageAt: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    const chats = await Chat.aggregate(pipeline);
    await Chat.populate(chats, {
      path: "participants.userId",
      select: "fullName avatar isOnline lastSeen email phone",
    });

    return NextResponse.json(chats);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/chat/list",
      method: "GET",
      req,
    });
  }
}
