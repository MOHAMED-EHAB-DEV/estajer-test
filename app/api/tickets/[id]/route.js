import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { handleApiError } from "@/lib/errorHandler";
import cloudinary from "@/lib/cloudinary";
import { updateAlert } from "@/lib/alert";
import { authenticateUser } from "@/middleware/auth";
import { sendTicketReplyEmail } from "@/lib/emails/ticket-reply";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("vid");

    let user = null;
    try {
      user = await authenticateUser();
    } catch (err) {
      // Allow moving forward to check visitorId
    }

    const ticket = await Ticket.findById(id)
      .populate("user", "fullName avatar email phone")
      .populate("messages.sender", "fullName avatar email")
      .lean();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check authorization
    if (user) {
      if (
        user.accountType !== "admin" &&
        ticket.user?._id?.toString() !== user._id.toString()
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      if (!ticket.visitorId || ticket.visitorId !== visitorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/tickets/${id}`,
      method: "GET",
      req,
    });
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const user = await authenticateUser();
    const { status } = await req.json();

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (
      user.accountType !== "admin" &&
      ticket.user?.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (status) {
      ticket.status = status;
      await ticket.save();
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/tickets/${id}`,
      method: "PATCH",
      req,
    });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("vid");

    let user = null;
    try {
      user = await authenticateUser();
    } catch (err) {
      // Allow moving forward to check visitorId
    }

    const { content, attachments } = await req.json();

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: "Content or attachments required" },
        { status: 400 },
      );
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check authorization
    if (user) {
      if (
        user.accountType !== "admin" &&
        ticket.user?.toString() !== user._id.toString()
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      if (!ticket.visitorId || ticket.visitorId !== visitorId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    let images = [];
    if (attachments && attachments.length > 0) {
      images = await Promise.all(
        attachments.map(async (image) => {
          // image could be a base64 string
          if (typeof image === "string" && image.startsWith("data:image")) {
            const uploaded = await cloudinary.uploader.upload(image, {
              folder: "tickets",
              format: "webp",
            });
            return uploaded.secure_url;
          }
          // if it's already an url or preview properly handled
          if (image?.preview) {
            const uploaded = await cloudinary.uploader.upload(image.preview, {
              folder: "tickets",
              format: "webp",
            });
            return uploaded.secure_url;
          }
          return image; // assume it's already a url if not caught above
        }),
      );
    }

    const newMessage = {
      sender: user?._id || null, // null for visitors
      content: content || "",
      state: "sent",
      attachments: images,
      isAdmin: user?.accountType === "admin",
    };

    ticket.messages.push(newMessage);
    ticket.lastMessageAt = Date.now();
    await ticket.save();

    // Update alert
    await updateAlert("ticket", ticket._id);

    // Send email notification if admin is replying
    if (newMessage.isAdmin) {
      // Use fire and forget to avoid delaying the response, 
      // but catch errors to prevent crashing
      sendTicketReplyEmail({
        email: ticket.email,
        name: ticket.name,
        ticketId: ticket._id,
        visitorId: ticket.visitorId,
        subject: ticket.title || ticket.subject,
        message: newMessage.content,
        attachments: newMessage.attachments,
        lang: ticket.lang || "ar",
        isUser: !!ticket.user,
      }).catch((err) => console.error("Error sending ticket reply email:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/tickets/${id}`,
      method: "POST",
      req,
    });
  }
}
