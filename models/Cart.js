import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  items: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now, expires: "30d" },
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
