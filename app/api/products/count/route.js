import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authHeaders } from "@/middleware/authHeaders";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req, params) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const user = await authHeaders(req);

    const query = {
      rejected: false,
    };

    if (user?.accountType === "admin") {
      const isAdmin = searchParams.get("isAdmin");

      if (isAdmin) query.approved = false;

      if (!isAdmin) query.owner = user._id;
      query.approved = true;
    } else {
      query.approved = true;
      query.owner = user._id;
    }

    // Count approved products for the user OR Count unapproved products for the admin
    const productsCount = await Product.countDocuments(query);

    return NextResponse.json({ success: true, productsCount });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products/count",
      method: "GET",
      req,
    });
  }
}
