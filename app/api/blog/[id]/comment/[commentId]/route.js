import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Blog from "@/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(req, { params }) {
  try {
    const { id, commentId } = await params;
    const data = await req.json();

    if (!data.comment)
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );

    await connectDB();
    const user = await authenticateUser();

    if (user?._id.toString() !== data.owner) return NextResponse.json({ error: "You are not authorized to update this comment" }, { status: 500 });

    const update = data.subCommentId
      ? {
        "comments.$[comment].subComments.$[sub].text": data.comment,
      }
      : {
        "comments.$[comment].text": data.comment,
      };

    const arrayFilters = data.subCommentId
      ? [{ "comment._id": commentId }, { "sub._id": data.subCommentId }]
      : [{ "comment._id": commentId }];

    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true, arrayFilters }
    );

    if (!updatedBlog)
      return NextResponse.json(
        { error: "Blog or Comment not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/blog/[id]/comment/[commentId]",
      method: "PATCH",
      req,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, commentId } = await params;
    const body = await req.json();
    const { subCommentId, userId } = body;

    await connectDB();
    const user = await authenticateUser();

    if (user?._id.toString() !== userId)
      return NextResponse.json({ error: "You are not authorized to update this comment" }, { status: 500 });

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      subCommentId
        ? {
          $pull: { "comments.$[comment].subComments": { _id: subCommentId } },
        }
        : { $pull: { comments: { _id: commentId } } },
      {
        new: true,
        arrayFilters: subCommentId ? [{ "comment._id": commentId }] : [],
      }
    );

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/blog/[id]/comment/[commentId]",
      method: "DELETE",
      req,
    });
  }
}
