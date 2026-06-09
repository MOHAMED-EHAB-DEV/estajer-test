import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";

// GET - Fetch all tasks with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const createdBy = searchParams.get("createdBy");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "priority";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const showCompleted = searchParams.get("showCompleted");

    // Build query
    const query = {};

    // Status filter - default to showing only non-completed tasks
    if (status) {
      query.status = status;
    } else if (showCompleted !== "true") {
      query.status = { $ne: "completed" };
    }

    if (type) {
      query.type = type;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Secondary sort by priority if not already sorting by priority
    if (sortBy !== "priority") {
      sortConfig.priority = -1;
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("createdBy", "fullName email avatar")
        .populate("assignedTo", "fullName email avatar")
        .populate("completedBy", "fullName email avatar")
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate user and verify admin
    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      priority = 0,
      images = [],
      links = [],
      assignedTo,
      notes,
    } = body;

    // Validation
    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary if they are base64
    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        if (image.url && image.url.startsWith("data:image")) {
          const uploaded = await cloudinary.uploader.upload(image.url, {
            folder: "tasks",
            format: "webp",
          });
          return {
            url: uploaded.secure_url,
            alt: image.alt || "task image",
          };
        }
        return image; // Keep existing Cloudinary URLs
      })
    );

    const task = await Task.create({
      title,
      description,
      type,
      priority,
      images: uploadedImages,
      links,
      createdBy: user._id,
      assignedTo: assignedTo || null,
      notes,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "fullName email avatar")
      .populate("assignedTo", "fullName email avatar")
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedTask,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
