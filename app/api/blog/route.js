import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import cloudinary from "@/lib/cloudinary";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const showAll = searchParams.get("showAll") === "true";
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = parseInt(searchParams.get("skip")) || 0;
    const lang = searchParams.get("lang") || "";
    const category = searchParams.get("category");
    const isAdmin = searchParams.get("accountType") === "admin";
    const exclude = searchParams.get("exclude");
    const length = searchParams.get("length") || 600;
    const random = searchParams.get("random") === "true";

    let query = showAll && isAdmin ? {} : { hidden: false };

    if (category && category !== "all") query.category = category;

    if (exclude) query.urlName = { $ne: exclude };

    let blogPosts, total;

    if (random) {
      // Use aggregation for random sampling
      const pipeline = [
        { $match: query },
        { $sample: { size: limit } },
        {
          $project: {
            [`title${lang}`]: 1,
            thumbnail: 1,
            [`content${lang}`]: 1,
            createdAt: 1,
            category: 1,
            urlName: 1,
            altText: 1,
            ...(showAll && isAdmin && { hidden: 1 }),
          },
        },
      ];

      [blogPosts, total] = await Promise.all([
        Blog.aggregate(pipeline),
        Blog.countDocuments(query),
      ]);
    } else {
      [blogPosts, total] = await Promise.all([
        Blog.find(query)
          .select(
            `title${lang} thumbnail content${lang} createdAt category urlName altText ${
              showAll && isAdmin && "hidden"
            }`,
          )
          .sort({ _id: -1 })
          .limit(limit)
          .skip(skip)
          .lean(),
        Blog.countDocuments(query),
      ]);
    }

    blogPosts.forEach((post) => {
      post.title = post[`title${lang}`];
      post.content = post[`content${lang}`];
      if (length && post.content) {
        post.content = post.content
          .replace(/<[^>]+>/g, "")
          .substring(0, length);
      }
      delete post[`title${lang}`];
      delete post[`content${lang}`];
    });

    return NextResponse.json({
      success: true,
      data: blogPosts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/blog",
      method: "GET",
      req,
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const data = await req.json();

    if (!user && user?.accountType !== "admin")
      throw new Error("Invalid Authentication you can't post a blog");

    if (!data.titleAr || !data.titleEn || !data.contentAr || !data.contentEn)
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    if (!data.urlName)
      return NextResponse.json(
        { error: "Url Name is required" },
        { status: 400 },
      );
    if (!data.thumbnail)
      return NextResponse.json({ error: "Invalid thumbnail" }, { status: 400 });
    if (!data.category)
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );

    const uploadedImage = await cloudinary.uploader.upload(
      data.thumbnail[0].preview,
      { folder: "blog", format: "webp" },
    );

    const blog = await Blog.create({
      ...data,
      thumbnail: {
        preview: uploadedImage.secure_url,
        gradientColors: data.thumbnail[0].gradientColors,
        gradientStyle: data.thumbnail[0].gradientStyle,
      },
      comments: [],
    });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/blog",
      method: "POST",
      req,
      requestBody: data,
    });
  }
}
