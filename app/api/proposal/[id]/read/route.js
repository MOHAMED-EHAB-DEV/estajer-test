import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authenticateUser } from "@/middleware/auth";
import Proposal from "@/models/Proposal";
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

    // Update proposal status to read
    const updatedProposal = await Proposal.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!updatedProposal) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedProposal });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/proposal/[id]/read",
      method: "PATCH",
      id,
      req: request,
    });
  }
}
