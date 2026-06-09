import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import Contact from "@/models/Contact";
import { sendContactReplyEmail } from "@/lib/email";
import connectDB from "@/lib/db";
import { handleApiError } from "@/lib/errorHandler";
import cloudinary from "@/lib/cloudinary";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { message, images } = await request.json();

    // Authenticate user and check if admin
    const user = await authenticateUser(request);
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Validate message
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Reply message is required" },
        { status: 400 }
      );
    }

    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        const uploaded = await cloudinary.uploader.upload(image.preview, {
          folder: "contacts",
          format: "webp",
        });
        return uploaded.secure_url;
      })
    );

    // Find the contact and update status
    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        status: "replied", replyMessage: {
          message,
          attachments: uploadedImages
        }
      },
      { new: true }
    );

    if (!contact)
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    // Send email to the user with the reply
    try {
      await sendContactReplyEmail({
        email: contact.email,
        name: contact.name,
        subject: contact.subject,
        originalMessage: contact.message,
        replyMessage: message,
        lang: contact.lang,
        attachments: uploadedImages,
      });
    } catch (emailError) {
      console.error("Error sending reply email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      contact,
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/contact/[id]/reply",
      method: "POST",
      id,
      req: request,
    });
  }
}
