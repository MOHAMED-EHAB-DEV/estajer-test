import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import Product from "@/models/Product";
import Sponsor from "@/models/Sponsor";
import { revalidateTag } from "next/cache";

// GET - Fetch a single category by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const category = await Category.findById(id)
      .populate("createdBy", "fullName")
      .populate({
        path: "subcategories",
        options: { sort: { order: 1, createdAt: -1 } },
      });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/categories/${params?.id}`,
      method: "GET",
      req,
    });
  }
}

// PUT - Update a category
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const data = await req.json();
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // If key is being changed, check for duplicates
    if (data.key && data.key !== category.key) {
      const existingCategory = await Category.findOne({
        key: data.key,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: "Category key already exists" },
          { status: 400 },
        );
      }

      if (!category.parentCategory) {
        // Main category
        await Promise.all([
          Product.updateMany(
            { category: category.key },
            { $set: { category: data.key } },
          ),
          Sponsor.updateMany(
            { category: category.key },
            { $set: { category: data.key } },
          ),
        ]);
      } else {
        // Subcategory
        await Product.updateMany(
          { subCategory: category.key },
          { $set: { subCategory: data.key } },
        );
      }
      await revalidateTag("everyProduct");
      await revalidateTag("categories");
    }

    // Handle image update
    let imageUrl = category.image;
    if (data.image && data.image !== category.image) {
      // Check if it's a new base64 image
      if (data.image.startsWith("data:")) {
        const uploaded = await cloudinary.uploader.upload(data.image, {
          folder: "categories",
          format: "webp",
        });
        imageUrl = uploaded.secure_url;
      } else {
        imageUrl = data.image;
      }
    }

    // Handle parent category change
    const isSubcategory = data.parentCategory && data.parentCategory !== "main";
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        nameAr: data.nameAr || category.nameAr,
        nameEn: data.nameEn || category.nameEn,
        key: data.key || category.key,
        image: imageUrl,
        status: data.status || category.status,
        parentCategory: isSubcategory ? data.parentCategory : null,
        order: data.order ?? category.order,
        hideFromHome: data.hideFromHome ?? category.hideFromHome,
        nana: data.nana ?? category.nana,
        seoTitleAr: data.seoTitleAr ?? category.seoTitleAr,
        seoTitleEn: data.seoTitleEn ?? category.seoTitleEn,
        seoDescriptionAr: data.seoDescriptionAr ?? category.seoDescriptionAr,
        seoDescriptionEn: data.seoDescriptionEn ?? category.seoDescriptionEn,
        seoKeywordsAr: data.seoKeywordsAr ?? category.seoKeywordsAr,
        seoKeywordsEn: data.seoKeywordsEn ?? category.seoKeywordsEn,
        richContentAr: data.richContentAr ?? category.richContentAr,
        richContentEn: data.richContentEn ?? category.richContentEn,
      },
      { new: true },
    ).populate("createdBy", "fullName");

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/categories/${params?.id}`,
      method: "PUT",
      req,
    });
  }
}

// DELETE - Delete a single category
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const { id } = await params;

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // Delete all subcategories first
    await Category.deleteMany({ parentCategory: id });

    // Delete the main category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/categories/${params?.id}`,
      method: "DELETE",
      req,
    });
  }
}
