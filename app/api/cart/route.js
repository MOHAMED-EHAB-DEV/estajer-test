import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";

export async function POST(req) {
  try {
    await connectDB();
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const cart = await Cart.create({ items: cartItems });

    return NextResponse.json({ success: true, id: cart._id });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/cart",
      method: "POST",
      req,
    });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Cart ID is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findById(id);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, cartItems: cart.items });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/cart",
      method: "GET",
      req,
    });
  }
}
