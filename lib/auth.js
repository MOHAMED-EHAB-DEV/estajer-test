import jwt from "jsonwebtoken";
import User from "@/models/User";
import { cookies } from "next/headers";
import connectDB from "./db";

// Server-side auth
export async function getUserFromServer(headerToken = null) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token");
    const token = headerToken || cookieToken?.value;

    if (!token) return null;
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select({
      password: 0,
      verificationCode: 0,
      blockedUsers: 0,
      vomId: 0,
      waffyId: 0,
      clientUserToken: 0,
      nafathTempId: 0,
      nafathData: 0,
      isOnline: 0,
      lastSeen: 0,
      rating: 0,
      createdAt: 0,
    });

    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Server auth error:", error);
    return null;
  }
}
