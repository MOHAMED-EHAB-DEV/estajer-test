import connectDB from "@/lib/db";
import Sponsor from "@/models/Sponsor";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "ar";
    const limitPerSponsor = parseInt(searchParams.get("limit")) || 4;
    const langSuffix = lang === "en" ? "En" : "Ar";

    const sponsors = await Sponsor.find({
      isActive: true,
      $or: [
        { sponsorshipEndDate: null },
        { sponsorshipEndDate: { $gte: new Date() } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3);

    if (!sponsors.length) return NextResponse.json({ success: true, data: [] });

    const sponsorIds = sponsors.map((s) => s.user);

    const productsPromises = sponsorIds.map((userId) =>
      Product.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
            approved: true,
            rejected: false,
            hidden: false,
            deleted: { $ne: true },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: limitPerSponsor },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: "$owner" },
        {
          $project: {
            _id: 1,
            images: { $slice: ["$images", 1] },
            owner: { "companyDetails.taxCode": 1, _id: 1 },
            name: `$name${langSuffix}`,
            rental: {
              value: "$rental.value",
              discountTiers: {
                $filter: {
                  input: "$rental.discountTiers",
                  as: "tier",
                  cond: { $eq: ["$$tier.minDays", 1] },
                },
              },
              packages: { $slice: ["$rental.packages", 1] },
            },
            rating: 1,
            pricingModel: 1,
            location: { coordinates: 1 },
            address: `$address${langSuffix}`,
            lovedCount: 1,
          },
        },
      ]),
    );

    const productsResults = await Promise.all(productsPromises);

    const interleavedProducts = [];
    const maxLen = Math.max(...productsResults.map((res) => res.length));

    for (let i = 0; i < maxLen; i++) {
      productsResults.forEach((sponsorProducts) => {
        if (sponsorProducts[i]) interleavedProducts.push(sponsorProducts[i]);
      });
    }

    return NextResponse.json({ success: true, data: interleavedProducts });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products/sponsored-latest",
      method: "GET",
      req,
    });
  }
}
