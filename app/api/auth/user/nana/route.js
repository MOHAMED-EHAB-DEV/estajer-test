import { getUserFromServer } from "@/lib/auth";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/errorHandler";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const headerToken = authHeader?.split(" ")[1];

    const user = await getUserFromServer(headerToken);

    if (!user) {
      const { searchParams } = new URL(request.url);
      const nanaId = searchParams.get("nanaId");
      if (!nanaId) throw new Error("Nana ID is required");
      const user = await User.findOne({ nanaId });
      if (user) {
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" },
        );
        return NextResponse.json({ token, user });
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/auth/user",
      method: "GET",
      req: request,
    });
  }
}
