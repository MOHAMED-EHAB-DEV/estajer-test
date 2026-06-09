import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Review from "@/models/review";
import Order from "@/models/Order";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";
import cloudinary from "@/lib/cloudinary";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang");
    const langSuffix = lang ? (lang === "en" ? "En" : "Ar") : "";

    // Get user data
    const user = await User.findOne(
      { ...(id.length === 24 ? { _id: id } : { pathName: id }) },
      {
        bioAr: 1,
        bioEn: 1,
        stats: 1,
        avatar: 1,
        rating: 1,
        fullName: 1,
        lastSeen: 1,
        createdAt: 1,
        pathName: 1,
        address: 1,
        accountType: 1,
        documentCode: 1,
        premium: 1,
        branches: 1,
        profileImageStatus: 1,
        rejectedImage: 1,
        rejectionReason: 1,
        reviewRequested: 1,
      },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Get counts in parallel
    const [productsCount, reviewsCount, requestedCount, ordersCount] =
      await Promise.all([
        Product.countDocuments({ owner: user._id, approved: true }),
        Review.countDocuments({ "product.owner": user._id }),
        Product.countDocuments({ owner: user._id, type: "request" }),
        Order.countDocuments({
          ownerData: user._id,
          status: { $in: ["received", "completed"] },
        }),
      ]);

    // Get average rating
    const reviews = await Review.find(
      { "product.owner": user._id },
      { rating: 1 },
    );

    // Apply language transformation for bio fields
    const userData = user.toObject();
    if (lang && (userData.bioAr || userData.bioEn)) {
      userData.bio = userData[`bio${langSuffix}`] || userData.bio;
      delete userData.bioEn;
      delete userData.bioAr;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        stats: {
          productsCount,
          reviewsCount,
          requestedCount,
          ordersCount,
          reviewsCount: reviews.length,
        },
      },
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/users/[id]",
      method: "GET",
      req,
      id,
    });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const data = await request.json();

    const {
      fullName,
      email,
      phone,
      address,
      pathName,
      bioAr,
      bioEn,
      accountType,
      premium,
      isBanned,
      isVerified,
      isRenter,
      hasBranches,
      companyDetails,
      iban,
      nationalId,
      commission,
      documentCode,
      skipIbanVerification,
      avatar,
      profileImageStatus,
      rejectedImage,
      rejectionReason,
      reviewRequested,
    } = data;

    let updateData = {};

    // Build update object
    if (avatar !== undefined) {
      if (avatar && avatar.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          format: "webp",
        });
        updateData.avatar = uploadResponse.secure_url;
      } else {
        updateData.avatar = avatar;
      }
    }
    if (profileImageStatus !== undefined)
      updateData.profileImageStatus = profileImageStatus;
    if (rejectedImage !== undefined) updateData.rejectedImage = rejectedImage;
    if (rejectionReason !== undefined)
      updateData.rejectionReason = rejectionReason;
    if (reviewRequested !== undefined)
      updateData.reviewRequested = reviewRequested;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (bioAr !== undefined) updateData.bioAr = bioAr;
    if (bioEn !== undefined) updateData.bioEn = bioEn;
    if (accountType !== undefined) updateData.accountType = accountType;
    if (premium !== undefined) updateData.premium = premium;
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isRenter !== undefined) updateData.isRenter = isRenter;
    if (hasBranches !== undefined) updateData.hasBranches = hasBranches;
    if (companyDetails !== undefined)
      updateData.companyDetails = companyDetails;
    if (iban !== undefined) updateData.iban = iban;
    if (nationalId !== undefined) updateData.nationalId = nationalId;
    if (commission !== undefined) updateData.commission = commission;
    if (documentCode !== undefined) updateData.documentCode = documentCode;
    if (skipIbanVerification !== undefined)
      updateData.skipIbanVerification = skipIbanVerification;

    // Check for unique constraints
    if (email || phone || pathName) {
      const existingUser = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
          ...(pathName ? [{ pathName: pathName.toLowerCase() }] : []),
        ],
        _id: { $ne: id },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email, phone, or username already exists" },
          { status: 400 },
        );
      }
    }

    if (pathName !== undefined) updateData.pathName = pathName.toLowerCase();

    // If banning a user, hide all their products
    if (isBanned === true) {
      await Product.updateMany({ owner: id }, { $set: { hidden: true } });
    } else if (isBanned === false) {
      await Product.updateMany(
        { owner: id, approved: true },
        { $set: { hidden: false } },
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { runValidators: true, new: true },
    ).select("-password -verificationCode");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/users/[id]",
      method: "PATCH",
      req: request,
      id,
    });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Don't allow deleting admin accounts
    const targetUser = await User.findById(id);
    if (targetUser?.accountType === "admin") {
      return NextResponse.json(
        { success: false, error: "Cannot delete admin accounts" },
        { status: 400 },
      );
    }

    // Hide all user's products before deletion
    await Product.updateMany({ owner: id }, { $set: { hidden: true } });

    // Delete user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: "/api/users/[id]",
      method: "DELETE",
      req: request,
      id,
    });
  }
}
