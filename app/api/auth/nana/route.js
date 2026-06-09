import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generatePathName } from "@/lib/utils";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import handleApiError from "@/lib/errorHandler";

export async function POST(req) {
  const data = await req.json();
  try {
    await connectDB();
    const user = await User.findOne({ nanaId: data.nanaId });
    if (!user) {
      // const password = `Nana@${data.nanaId}/estajer${Math.floor(Math.random() * data.nanaId?.length)}`;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      const userData = {
        ...data,
        isRenter: true,
        password: hashedPassword,
        pathName: generatePathName(data.email),
        accountType: "personal",
        isVerified: true,
        location: {
          lat: data.location?.lat,
          lng: data.location?.lng,
        },
      };
      const newUser = await User.create(userData).catch((error) => {
        throw error;
      });
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
      return NextResponse.json({ token }, { status: 201 });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    if (
      error.message === "Email must be unique" ||
      error.message === "Phone number must be unique"
    ) {
      const user = await User.findOne({
        $or: [{ email: data.email }, { phone: data.phone }],
      });
      user.nanaId = data.nanaId;
      user.location = data.location;
      user.address = data.address;
      await user.save();
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
      return NextResponse.json({ token }, { status: 200 });
    }
    return handleApiError(error, {
      endpoint: "/api/auth/nana",
      method: "POST",
      req,
      requestBody: { ...req.body, user: { _id: "REDACTED" } },
    });
  }
}
