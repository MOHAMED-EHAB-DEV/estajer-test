import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SupportChat from "@/models/SupportChat";
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

      const orConditions = [{ userId: { $in: userIds } }];
      if (mongoose.Types.ObjectId.isValid(term)) {
        orConditions.push({ _id: term });
        orConditions.push({ userId: term });
      }
      query.$or = orConditions;
    }

    const chats = await SupportChat.aggregate([
      { $match: query },
      {
        $addFields: {
          hasMultipleMsgs: {
            $cond: [
              { $gte: [{ $size: { $ifNull: ["$messages", []] } }, 2] },
              1,
              0,
            ],
          },
        },
      },
      {
        $sort: {
          hasMultipleMsgs: -1,
          lastMessageAt: -1,
          updatedAt: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          userId: 1,
          feedbackItems: 1,
          aiMode: 1,
          lastMessageAt: 1,
          createdAt: 1,
          updatedAt: 1,
          messages: { $slice: ["$messages", -1] },
        },
      },
    ]);

    await SupportChat.populate(chats, {
      path: "userId",
      select: "fullName avatar isOnline lastSeen email phone",
    });

    return NextResponse.json(chats);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/support/list",
      method: "GET",
      req,
    });
  }
}
