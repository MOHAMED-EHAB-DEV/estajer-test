import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    // Check if user is admin
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Update contact status to read
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedContact });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/contact/[id]/read",
      method: "PATCH",
      id,
      req: request,
    });
  }
}
