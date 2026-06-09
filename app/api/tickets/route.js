import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";
import { updateAlert } from "@/lib/alert";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const status = searchParams.get("status");
    const dateAdded = searchParams.get("dateAdded");
    const search = searchParams.get("search");
    
    let user = null;
    try {
      user = await authenticateUser();
    } catch (err) {}

    let query = {};

    if (user) {
      if (user.accountType !== "admin") {
        query.user = user._id;
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (startDateParam || endDateParam) {
      query.createdAt = {};
      if (startDateParam) {
        const start = new Date(startDateParam);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    } else if (dateAdded && dateAdded !== "all") {
      const now = new Date();
      let startDate;
      switch (dateAdded) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
      }
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      
      const isValidObjectId = mongoose.Types.ObjectId.isValid(search);
      if (isValidObjectId) {
         query.$or.push({ _id: search });
      }
    }

    const totalTickets = await Ticket.countDocuments(query);
    const totalPages = Math.ceil(totalTickets / limit);

    const tickets = await Ticket.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate("user", "fullName avatar email phone")
      .populate("messages.sender", "fullName avatar email")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        totalTickets,
        totalPages,
        currentPage: page,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/tickets",
      method: "GET",
      req,
    });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    let user = null;
    try {
      user = await authenticateUser();
    } catch (_) {
      user = null;
    }

    const {
      name,
      email,
      subject,
      message,
      phone,
      ticketImages,
      lang,
      visitorId,
    } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    let images;

    if (ticketImages && ticketImages.length > 0) {
      images = await Promise.all(
        ticketImages.map(async (image) => {
          const uploaded = await cloudinary.uploader.upload(image.preview, {
            folder: "tickets",
            format: "webp",
          });
          return uploaded.secure_url;
        }),
      );
    }

    // Store ticket form submission in database
    const ticketSubmission = await Ticket.create({
      name,
      title: message.substring(0,20),
      email,
      phone,
      subject,
      message,
      lang,
      messages: [
        {
          sender: user?._id || null,
          content: message,
          state: "sent",
          attachments: images && images.length > 0 ? images : [],
          isAdmin: false,
        },
      ],
      user: user?._id || null,
      visitorId: !user ? visitorId : null,
    });
    await updateAlert("ticket", ticketSubmission._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/ticket",
      method: "POST",
      req: request,
    });
  }
}