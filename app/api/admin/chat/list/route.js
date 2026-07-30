import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import User from "@/models/User";
import mongoose from "mongoose";
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
    if (user.accountType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let query = {};
    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, "i");
      const matchingUsers = await User.find({
        $or: [{ fullName: regex }, { email: regex }],
      }).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      const orConditions = [
        { "participants.userId": { $in: userIds } },
        { chatId: regex },
      ];
      if (mongoose.Types.ObjectId.isValid(term)) {
        orConditions.push({ _id: term });
        orConditions.push({ "participants.userId": term });
      }
      query.$or = orConditions;
    }

    const chats = await Chat.find(query)
      .populate("participants.userId", "fullName avatar isOnline lastSeen")
      .slice("messages", -1)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
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
