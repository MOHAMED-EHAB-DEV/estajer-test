import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Proposal from "@/models/Proposal";
import { sendProposalReplyEmail } from "@/lib/emails/proposal";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing proposal id" },
        { status: 400 }
      );
    }

    const { message, lang } = await request.json();

    const user = await authenticateUser(request);
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { error: "Reply message is required" },
        { status: 400 }
      );
    }

    const proposal = await Proposal.findByIdAndUpdate(
      id,
      { status: "replied", replay: message },
      { new: true }
    );

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    let mailResult = null;
    try {
      mailResult = await sendProposalReplyEmail({
        email: proposal.email,
        name: proposal.name,
        subject: proposal.title,
        originalMessage: proposal.description?.slice(0, 50),
        replyMessage: message,
        proposalId: proposal._id?.toString?.() || id,
        proposalTitle: proposal.title,
        responderName: user.fullName || "فريق الدعم",
        lang,
      });
    } catch (emailError) {
      console.error("Error sending reply email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      proposal,
      email: {
        sent: !!(mailResult && (mailResult.messageId || mailResult.accepted)),
        result: mailResult || null,
      },
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/proposal/[id]/reply",
      method: "POST",
      id,
      req: request,
    });
  }
}
