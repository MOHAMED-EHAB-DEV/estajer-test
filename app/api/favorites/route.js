import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Favorite from "@/models/Favorite";
import Product from "@/models/Product";
import { handleApiError } from "@/lib/errorHandler";

// GET user's favorite products
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang");
    const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";

    // Authenticate user
    const user = await authenticateUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's favorites with populated product details
    const favorite = await Favorite.findOne({ userId: user._id })
      .populate({
        path: "products",
        select: `images name${langSuffix} rental.value`,
      })
      .lean();
    const products = favorite?.products?.map((product) => {
      const tempProduct = { ...product };
      tempProduct.name = product[`name${langSuffix}`];
      delete tempProduct[`name${langSuffix}`];
      return tempProduct;
    });
    return NextResponse.json({ success: true, favorites: products || [] });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/favorites",
      method: "GET",
      req,
    });
  }
}

// POST to add a product to favorites
export async function POST(request) {
  try {
    await connectDB();

    // Get product ID from request body
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get or create user's favorite document
    let favorite = await Favorite.findOne({ userId: user._id });
    if (!favorite) {
      favorite = await Favorite.create({ userId: user._id, products: [] });
    }

    const productExists = favorite.products.includes(productId);

    if (productExists) {
      return NextResponse.json({
        success: true,
        message: "Product already in favorites",
      });
    }

    await Product.findByIdAndUpdate(productId, {
      $inc: { lovedCount: 1 },
    });

    favorite.products.push(productId);
    await favorite.save();

    return NextResponse.json({
      success: true,
      message: "Product added to favorites",
      favorites: favorite.products,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/favorites",
      method: "POST",
      req: request,
    });
  }
}

// DELETE to remove a product from favorites
export async function DELETE(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const favorite = await Favorite.findOne({ userId: user._id });
    if (favorite) {
      const hadProduct = favorite.products.includes(productId);
      if (hadProduct) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { lovedCount: -1 },
        });
      }

      favorite.products = favorite.products.filter(
        (id) => id.toString() !== productId
      );
      await favorite.save();
    }

    return NextResponse.json({
      success: true,
      message:
        user.lang === "ar"
          ? "تم إزالة المنتج من المفضلة"
          : "Product removed from favorites",
      favorites: favorite?.products,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/favorites",
      method: "DELETE",
      req: request,
    });
  }
}
