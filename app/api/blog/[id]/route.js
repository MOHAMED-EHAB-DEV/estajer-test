import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";
import { revalidateWithTag } from "@/actions/revalidateTag";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const fields = searchParams.get("fields");
    const lang = searchParams.get("lang");

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { urlName: id };
    const blog = await Blog.findOne(query)
      .select(fields.includes("all") ? "" : fields.replace(/,/g, " "))
      .populate(
        fields.includes("comments")
          ? {
              path: "comments",
              populate: [
                { path: "owner", select: "fullName avatar" },
                { path: "subComments.owner", select: "fullName avatar" },
              ],
            }
          : null
      )
      .lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    if (lang) {
      blog.title = blog[`title${lang}`];
      blog.content = blog[`content${lang}`];
      delete blog[`title${lang}`];
      delete blog[`content${lang}`];
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/blog/[id]",
      method: "GET",
      req,
      id,
    });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await req.json();

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog Post not found" },
        { status: 404 }
      );
    }

    if (data.commentId) {
      // Handle adding subComment
      const parentComment = blog.comments?.id(data.commentId);
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: "Parent comment not found" },
          { status: 404 }
        );
      }

      parentComment?.subComments?.push({
        owner: data.owner,
        text: data.comment,
      });
    } else {
      // Handle adding main comment
      blog.comments.push({
        owner: data.owner,
        text: data.comment,
        subComments: [],
      });
    }

    await revalidateWithTag(`blog-${blog._id}`);

    const updatedBlog = await blog.save();

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/blog/[id]",
      method: "POST",
      req,
      id,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin")
      throw new Error("Not Authenticated you can't update this blog");

    const data = await req.json();

    const blog = await Blog.findById(id);

    if (!blog)
      return NextResponse.json(
        { success: false, error: "Blog Post not found" },
        { status: 404 }
      );

    if (data.hidden === false || data.hidden === true) {
      const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { hidden: data.hidden },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updatedBlog });
    }

    const updatePayload = { ...data };

    // Ensure category is updated if provided
    if (data.category) updatePayload.category = data.category;
    if (data.seoTitleAr) updatePayload.seoTitleAr = data.seoTitleAr;
    if (data.seoTitleEn) updatePayload.seoTitleEn = data.seoTitleEn;
    if (data.seoDescriptionAr)
      updatePayload.seoDescriptionAr = data.seoDescriptionAr;
    if (data.seoDescriptionEn)
      updatePayload.seoDescriptionEn = data.seoDescriptionEn;
    if (data.urlName) updatePayload.urlName = data.urlName;
    if (data.altText) updatePayload.altText = data.altText;

    if (data.thumbnail) {
      if (
        data.thumbnail[0]?.preview &&
        data.thumbnail[0].preview !== blog.thumbnail.preview
      ) {
        const uploadedImage = await cloudinary.uploader.upload(
          data.thumbnail[0].preview,
          { folder: "blog", format: "webp" }
        );

        updatePayload.thumbnail = {
          preview: uploadedImage.secure_url,
          gradientColors: data.thumbnail[0].gradientColors,
          gradientStyle: data.thumbnail[0].gradientStyle,
        };
      } else {
        updatePayload.thumbnail = blog.thumbnail;
      }
    } else {
      updatePayload.thumbnail = blog.thumbnail;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/blog/[id]",
      method: "PATCH",
      req,
      id,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const user = await authenticateUser();

    if (!user || user.accountType !== "admin")
      throw new Error("Not Authenticated you can't delete this blog");

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);

    return NextResponse.json({ success: true, data: deletedBlog });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/blog/[id]",
      method: "DELETE",
      req,
      id,
    });
  }
}
