import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await authenticateUser();
    const data = await request.json();
    const {
      fullName,
      phone,
      address,
      pathName,
      bioAr,
      bioEn,
      location,
      nationalId,
      isRenter,
      companyName,
      registerNumber,
      taxCode,
      holidayPeriods,
    } = data;
    let newData = {};

    if (fullName) newData.fullName = fullName;
    if (phone) newData.phone = phone;
    if (address) newData.address = address;
    if (bioAr) newData.bioAr = bioAr;
    if (bioEn) newData.bioEn = bioEn;
    if (location) newData.location = location;
    if (nationalId) newData.nationalId = nationalId;
    if (!isRenter || isRenter) newData.isRenter = isRenter;

    if (companyName || registerNumber || taxCode) {
      newData.companyDetails = {
        ...user.companyDetails,
        companyName,
        registerNumber,
        taxCode,
      };
    }

    if (holidayPeriods !== undefined) {
      const valid = Array.isArray(holidayPeriods) &&
        holidayPeriods.every(
          (p) => p.from && p.to && new Date(p.from) <= new Date(p.to),
        );
      if (!valid)
        return NextResponse.json(
          { success: false, error: "Invalid holiday periods" },
          { status: 400 },
        );
      newData.holidayPeriods = holidayPeriods;
    }
    if (pathName && pathName !== user.pathName) {
      const existingUser = await User.findOne({
        pathName: pathName.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Path name already exists" },
          { status: 400 }
        );
      }
    }
    if (pathName) newData.pathName = pathName;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { ...newData } },
      { runValidators: true, new: true }
    ).select("-password -verificationCode");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/update-profile",
      method: "PATCH",
      req: request,
    });
  }
}
