import AiChat from "@/models/AiChat";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const pageNum = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (pageNum - 1) * limit;

    const sortField = searchParams.get("sortBy") || "lastMessageAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const search = searchParams.get("search") || "";

    await connectDB();

    let pipeline = [];
    if (search) {
      pipeline.push({
        $search: {
          index: "default",
          text: {
            query: search,
            path: ["visitorName", "visitorContact"],
            fuzzy: { maxEdits: 1 },
          },
        },
      });
      pipeline.push({
        $addFields: {
          score: { $meta: "searchScore" },
        },
      });
    }

    // Only get the necessary fields, compute messagesCount
    pipeline.push({
      $project: {
        _id: 1,
        sessionId: 1,
        user: 1,
        visitor: 1,
        visitorName: 1,
        visitorContact: 1,
        lastMessageAt: 1,
        spamCount: 1,
        createdAt: 1,
        updatedAt: 1,
        messagesCount: { $size: { $ifNull: ["$messages", []] } },
        score: { $ifNull: ["$score", 0] },
      },
    });

    let totalChats = 0;
    if (search) {
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await AiChat.aggregate(countPipeline);
      totalChats = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      totalChats = await AiChat.countDocuments();
    }

    if (search) {
      pipeline.push({ $sort: { score: -1, [sortField]: sortOrder } });
    } else {
      pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Lookup user to get email
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });
    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Project only user email and phone
    pipeline.push({
      $project: {
        _id: 1,
        sessionId: 1,
        user: { email: "$user.email", phone: "$user.phone" },
        visitor: 1,
        visitorName: 1,
        visitorContact: 1,
        lastMessageAt: 1,
        spamCount: 1,
        createdAt: 1,
        updatedAt: 1,
        messagesCount: 1,
        score: 1,
      },
    });

    const chats = await AiChat.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data: {
        chats,
        totalChats,
        totalPages: Math.ceil(totalChats / limit) || 1,
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error("Error fetching AI chats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI chats" },
      { status: 500 },
    );
  }
}
