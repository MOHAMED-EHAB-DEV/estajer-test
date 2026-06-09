import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/errorHandler";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    await connectDB();
    const user = await authenticateUser();

    const body = await request.json();
    const { profileImage, lang } = body;
    const currentLang = lang || "ar";

    if (!profileImage)
      return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Parallelize AI check and Cloudinary upload
    const promises = [
      cloudinary.uploader.upload(profileImage, {
        folder: "avatars",
        format: "webp",
      }),
    ];
    if (!user.premium) {
      const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, "");
      const mimeType =
        profileImage.match(/^data:(image\/\w+);base64,/)?.[1] || "image/webp";

      const prompt = `
You are a strict content moderation AI for a marketplace platform. Your goal is to review user-uploaded profile pictures and prevent users from uploading contact information or business logos to bypass the platform's messaging system.
Analyze the provided image and return a JSON object with the following structure:
{
"is_safe": boolean,
"rejection_reason": string (or null if safe)
}
Follow these strict rules for REJECTION:
TEXT DETECTION: Reject the image if it contains ANY : phone numbers, email addresses, social media handles (starting with @), website URLs, or QR codes.
LOGO DETECTION: Reject the image if it appears to be a company logo, a brand icon, or a graphic design meant for a business rather than a personal photo.
WATERMARKS: Reject if there are watermarks indicating contact info in all the image.
ACCEPTANCE CRITERIA:
The image should ideally be a human face, a generic avatar, the product they sell ,or an abstract image that does contain contact details.
If the image violates any rule, set "is_safe" to false and state the reason.
IMPORTANT: Return the "rejection_reason" in ${currentLang === "ar" ? "Arabic" : "English"}.`;

      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: { response_mime_type: "application/json" },
      });

      promises.push(
        model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType } },
        ]),
      );
    }

    const [uploadResult, aiResult] = await Promise.all(promises);

    let isSafe = true;
    let rejectionReason = null;

    if (aiResult) {
      const responseText = aiResult.response.text();
      const aiResponse = JSON.parse(responseText);
      if (!aiResponse.is_safe) {
        isSafe = false;
        rejectionReason = aiResponse.rejection_reason;
      }
    }

    if (!isSafe) {
      // Logic for Rejected Image
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            profileImageStatus: "rejected",
            rejectionReason: rejectionReason,
            rejectedImage: uploadResult.secure_url,
            reviewRequested: false,
          },
        },
        { new: true },
      ).select("-password -verificationCode");

      return NextResponse.json({
        success: false,
        rejectionReason,
        data: updatedUser,
      });
    }

    if (user.avatar && user.avatar !== DEFAULT_AVATAR) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          avatar: uploadResult.secure_url,
          profileImageStatus: "approved",
          rejectionReason: null,
          rejectedImage: null,
          reviewRequested: false,
        },
      },
      { new: true },
    ).select("-password -verificationCode");

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/profile-image",
      method: "POST",
      req: request,
    });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const user = await authenticateUser();

    // Delete current avatar from cloudinary if it's not the default
    if (user.avatar !== DEFAULT_AVATAR) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    // Reset to default avatar
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          avatar: DEFAULT_AVATAR,
          profileImageStatus: "approved",
          rejectionReason: null,
          rejectedImage: null,
        },
      },
      { new: true },
    ).select("-password -verificationCode");

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/profile-image",
      method: "DELETE",
      req: request,
    });
  }
}
