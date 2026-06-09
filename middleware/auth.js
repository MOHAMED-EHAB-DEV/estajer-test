import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/models/User";

export async function authenticateUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token || token === "undefined")
      throw new Error("Authentication required");

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) throw new Error("User not found");

    if (!user.isVerified) throw new Error("Email verification required");

    if (user.isBanned) throw new Error("User is banned");

    return user;
  } catch (error) {
    throw new Error(error.message || "Authentication failed");
  }
}