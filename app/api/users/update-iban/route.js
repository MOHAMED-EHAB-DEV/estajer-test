import { NextResponse } from "next/server";
import User from "../../../../models/User";
import connectDB from "../../../../lib/db";
import waffyAuth from "../../../../lib/waffy-auth";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function PATCH(req) {
  try {
    // Get user session
    const sessionUser = await authenticateUser();

    // Parse request body
    const { iban, unifiedNumber, userId } = await req.json();

    // Connect to database
    await connectDB();

    let user = sessionUser;

    if (userId && userId !== sessionUser._id.toString()) {
      if (sessionUser.accountType !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 },
        );
      }
      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    if (!iban)
      return NextResponse.json({ error: "IBAN is required" }, { status: 400 });

    // Validate IBAN format (basic Saudi IBAN validation)
    if (!iban.match(/^SA\d{22}$/)) {
      return NextResponse.json(
        { error: "Invalid IBAN format. Must be SA followed by 22 digits" },
        { status: 400 },
      );
    }

    // Connect to database already done above

    // Check if user has required data for Waffy signup
    if (user.accountType === "company") {
      if (!unifiedNumber) {
        return NextResponse.json(
          { error: "Unified number is required for company accounts." },
          { status: 400 },
        );
      }
    } else {
      if (!user.nationalId) {
        return NextResponse.json(
          {
            error: "National ID is required. Please update your profile first.",
          },
          { status: 400 },
        );
      }
    }

    // Check if user has waffyId, if not sign them up
    if (!user.waffyId) {
      try {
        const [firstName, ...lastNameParts] = user.fullName.split(" ");
        const lastName = lastNameParts.join(" ") || "User";

        const signupResult = await waffyAuth.signUpUser({
          clientUserId: user._id.toString(),
          phoneNumber: `+966${user.phone.slice(1)}`,
          firstName: firstName,
          lastName: lastName,
          password: `temp_${Date.now()}`,
        });

        if (signupResult.data?.userId) {
          user.waffyId = signupResult.data.userId;
          user.clientUserToken = signupResult.data.clientUserToken;
          await user.save();
        } else throw new Error("Failed to get waffyId from signup response");
      } catch (error) {
        console.error("Error signing up user to Waffy:", error);
        return NextResponse.json(
          { error: "Failed to register with payment provider" },
          { status: 500 },
        );
      }
    }

    // Call Waffy API to add bank details
    try {
      const userData = {
        iban: iban,
        currency: "SAR",
        beneficiaryName: user.fullName,
      };

      // Use unified number for company accounts, nationalId for others
      if (user.accountType === "company") {
        userData.nationalId = unifiedNumber;
      } else {
        userData.nationalId = user.nationalId;
      }

      const waffyResult = await waffyAuth.addUserIban({
        userId: user.waffyId,
        userData: userData,
      });
      console.log("Waffy bank details added successfully:", waffyResult);
    } catch (error) {
      console.error("Error adding bank details to Waffy:", error);
      return NextResponse.json(
        { error: "Failed to add bank details to payment provider" },
        { status: 500 },
      );
    }

    // Save IBAN to user record on success
    user.iban = iban;
    if (user.accountType === "company" && unifiedNumber) {
      user.unifiedNumber = unifiedNumber;
    }
    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(user._id).select(
      "-password -verificationCode",
    );

    return NextResponse.json({
      success: true,
      message:
        user.lang === "ar"
          ? "تم تحديث رقم الحساب بنجاح"
          : "IBAN updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/update-iban",
      method: "PATCH",
      req,
    });
  }
}
