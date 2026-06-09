import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function authHeaders(req, getFullName) {
  try {
    const token = req.headers.get("authorization");
    if (!token || token === "undefined") throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId, {
      isVerified: 1,
      accountType: 1,
      ...(getFullName && { fullName: 1 }),
    });

    if (!user) throw new Error("User not found");
    if (!user.isVerified) throw new Error("Email verification required");

    return user;
  } catch (error) {
    throw new Error(error.message || "Authentication failed");
  }
}
