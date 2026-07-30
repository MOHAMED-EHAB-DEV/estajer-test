import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SupportChat from "@/models/SupportChat";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

async function requireAdmin(req) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  const user = client ? await authenticateUser() : await authHeaders(req);
  if (user.accountType !== "admin") throw new Error("Unauthorized");
  return user;
}

export async function GET(req) {
  try {
    await connectDB();
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type") || "all"; // all, bug, suggestion, review
    const statusFilter = searchParams.get("status") || "all"; // all, pending, in_progress, resolved, hidden
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
    const sortBy = searchParams.get("sort") || "frequent"; // frequent, newest
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const chats = await SupportChat.find({}).populate(
      "userId",
      "fullName avatar email phone",
    );

    let globalTotalBugs = 0;
    let globalTotalSuggestions = 0;
    let globalTotalReviews = 0;

    const statusCounts = {
      all: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      hidden: 0,
    };

    const userGroups = [];

    for (const chat of chats) {
      if (!chat.feedbackItems || chat.feedbackItems.length === 0) continue;

      const userBugs = [];
      const userSuggestions = [];
      const userReviews = [];

      for (const item of chat.feedbackItems) {
        const summary = item.summary?.trim();
        if (!summary) continue;

        const itemStatus = item.status || "pending";
        const itemIsHidden = Boolean(item.isHidden);

        statusCounts.all++;
        if (itemIsHidden) {
          statusCounts.hidden++;
        } else if (statusCounts[itemStatus] !== undefined) {
          statusCounts[itemStatus]++;
        }

        const formattedItem = {
          id: item.id || crypto.randomUUID().slice(0, 8),
          type: item.type || "other",
          summary,
          imageUrl: item.imageUrl || null,
          status: itemStatus,
          isHidden: itemIsHidden,
          resolvedAt: item.resolvedAt || null,
          createdAt: item.createdAt || chat.updatedAt || new Date(),
        };

        if (item.type === "bug") {
          userBugs.push(formattedItem);
          globalTotalBugs++;
        } else if (item.type === "suggestion") {
          userSuggestions.push(formattedItem);
          globalTotalSuggestions++;
        } else if (item.type === "review") {
          userReviews.push(formattedItem);
          globalTotalReviews++;
        }
      }

      const totalItems = userBugs.length + userSuggestions.length + userReviews.length;
      if (totalItems === 0) continue;

      userGroups.push({
        user: {
          userId: chat.userId?._id || chat._id,
          name: chat.userId?.fullName || "مستخدم غير معروف",
          avatar: chat.userId?.avatar || null,
          email: chat.userId?.email || "",
          phone: chat.userId?.phone || "",
        },
        bugs: userBugs,
        suggestions: userSuggestions,
        reviews: userReviews,
        allItems: [...userBugs, ...userSuggestions, ...userReviews],
        bugsCount: userBugs.length,
        suggestionsCount: userSuggestions.length,
        reviewsCount: userReviews.length,
        totalCount: totalItems,
        lastFeedbackAt: chat.lastMessageAt || chat.updatedAt || new Date(),
      });
    }

    const typeCounts = {
      all: globalTotalBugs + globalTotalSuggestions + globalTotalReviews,
      bug: globalTotalBugs,
      suggestion: globalTotalSuggestions,
      review: globalTotalReviews,
    };

    // Filter items per user group by type & status
    let filteredGroups = userGroups
      .map((g) => {
        let items = g.allItems;

        // Filter by type
        if (typeFilter === "bug") items = g.bugs;
        else if (typeFilter === "suggestion") items = g.suggestions;
        else if (typeFilter === "review") items = g.reviews;

        // Filter by status
        if (statusFilter === "hidden") {
          items = items.filter((i) => i.isHidden);
        } else if (statusFilter !== "all") {
          items = items.filter((i) => !i.isHidden && i.status === statusFilter);
        } else {
          // 'all' status still hides items that are explicitly hidden unless requested
          items = items.filter((i) => !i.isHidden);
        }

        return {
          ...g,
          displayItems: items,
          displayCount: items.length,
        };
      })
      .filter((g) => g.displayCount > 0);

    // Search query filter
    if (searchQuery) {
      filteredGroups = filteredGroups.filter((g) => {
        const matchUser =
          g.user.name.toLowerCase().includes(searchQuery) ||
          g.user.email.toLowerCase().includes(searchQuery);
        const matchItem = g.displayItems.some((item) =>
          item.summary.toLowerCase().includes(searchQuery)
        );
        return matchUser || matchItem;
      });
    }

    // Sort user groups
    if (sortBy === "frequent") {
      filteredGroups.sort((a, b) => b.displayCount - a.displayCount);
    } else if (sortBy === "newest") {
      filteredGroups.sort((a, b) => new Date(b.lastFeedbackAt) - new Date(a.lastFeedbackAt));
    }

    // Pagination
    const totalItems = filteredGroups.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedGroups = filteredGroups.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      totalUsers: userGroups.length,
      counts: typeCounts,
      statusCounts,
      userGroups: paginatedGroups,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        limit,
      },
    });
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support/analytics",
      method: "GET",
      req,
    });
  }
}

// PATCH — update feedback item status or toggle isHidden
export async function PATCH(req) {
  try {
    await connectDB();
    await requireAdmin(req);

    const { userId, feedbackId, status, isHidden } = await req.json();

    if (!userId || !feedbackId) {
      return NextResponse.json({ error: "userId and feedbackId required" }, { status: 400 });
    }

    const chat = await SupportChat.findOne({ userId });
    if (!chat) {
      return NextResponse.json({ error: "Support chat not found" }, { status: 404 });
    }

    const item = chat.feedbackItems.find((f) => f.id === feedbackId);
    if (!item) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    if (status && ["pending", "in_progress", "resolved", "dismissed"].includes(status)) {
      item.status = status;
      if (status === "resolved") {
        item.resolvedAt = new Date();
      } else {
        item.resolvedAt = undefined;
      }
    }

    if (typeof isHidden === "boolean") {
      item.isHidden = isHidden;
    }

    await chat.save();

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support/analytics",
      method: "PATCH",
      req,
    });
  }
}

// DELETE — delete a feedback item
export async function DELETE(req) {
  try {
    await connectDB();
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const feedbackId = searchParams.get("feedbackId");

    if (!userId || !feedbackId) {
      return NextResponse.json({ error: "userId and feedbackId required" }, { status: 400 });
    }

    const chat = await SupportChat.findOne({ userId });
    if (!chat) {
      return NextResponse.json({ error: "Support chat not found" }, { status: 404 });
    }

    chat.feedbackItems = chat.feedbackItems.filter((f) => f.id !== feedbackId);
    await chat.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return handleApiError(error, {
      endpoint: "/api/admin/support/analytics",
      method: "DELETE",
      req,
    });
  }
}
