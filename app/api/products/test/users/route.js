import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    // get all user that have nafathData exist
    // const users = await User.find({ nafathData: { $exists: true } }).select(
    //   "nafathData",
    // );
    return NextResponse.json({
      success: true,
      // count: users.length,
      // data: users,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
