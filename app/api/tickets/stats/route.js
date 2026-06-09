import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authHeaders(req);

    let query = {};
    if (user.accountType !== "admin") {
      query.user = user._id;
    }

    const tickets = await Ticket.find(query).select("status user").lean();

    let newCount = 0;
    let inprogressCount = 0;
    let cancelledCount = 0;
    let solvedCount = 0;
    let userCount = 0;
    let guestCount = 0;

    tickets.forEach((ticket) => {
      if (ticket.status === "new") newCount++;
      if (ticket.status === "inprogress") inprogressCount++;
      if (ticket.status === "cancelled") cancelledCount++;
      if (ticket.status === "solved") solvedCount++;

      if (ticket.user) {
        userCount++;
      } else {
        guestCount++;
      }
    });

    const total = tickets.length;

    return NextResponse.json({
      success: true,
      data: {
        new: newCount,
        inprogress: inprogressCount,
        cancelled: cancelledCount,
        solved: solvedCount,
        total,
        userCount,
        guestCount,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/tickets/stats",
      method: "GET",
      req,
    });
  }
}
