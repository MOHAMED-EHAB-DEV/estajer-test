import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { authenticateUser } from "@/middleware/auth";
import waffyContract from "@/lib/waffy-contract";
import waffyAuth from "@/lib/waffy-auth";
import { sendCashoutRequirementsEmail } from "@/lib/email";
import { handleApiError } from "@/lib/errorHandler";
// Helper function to handle address creation from geocoding (copied from contractHandling.js)
async function handleUserAddress(location, waffyId, userId) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ar`,
  );
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("No geocoding results found");
  }
  const result = data.results[0];
  const addressComponents = result.address_components;
  const addressData = {
    addressLabel: "HOME",
    street: "",
    district: "",
    postalCode: "",
    city: "",
    countryCode: "SA",
  };
  addressComponents.forEach((component) => {
    const types = component.types;
    if (types.includes("street_number") || types.includes("route")) {
      addressData.street = addressData.street
        ? `${addressData.street} ${component.long_name}`
        : component.long_name;
    }
    if (
      types.includes("sublocality") ||
      types.includes("sublocality_level_1") ||
      types.includes("neighborhood")
    ) {
      addressData.district = component.long_name;
    }
    if (types.includes("postal_code")) {
      addressData.postalCode = component.long_name;
    }
    if (
      types.includes("locality") ||
      types.includes("administrative_area_level_2")
    ) {
      addressData.city = component.long_name;
    }
    if (types.includes("country")) {
      addressData.countryCode = component.short_name;
    }
  });
  const res = await waffyAuth.addUserAddress({
    userId: waffyId,
    userData: addressData,
  });
  if (res.status === 201) {
    await User.findByIdAndUpdate(userId, {
      waffyAddress: true,
    });
  }
  return res;
}
export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }
    const { id } = await params;
    const order = await Order.findById(id).populate("ownerData");
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }
    // Fetch current status from Waffy
    let waffyStatus = null;
    let milestones = [];
    if (order.contractId) {
      const data = await waffyContract.getContractMilestones(order.contractId);
      waffyStatus = data?.data?.content?.[0]?.status;
      milestones = data?.data?.content || [];
    }
    // Check requirements
    const hasValidLocation =
      order.ownerData?.location?.lat !== undefined &&
      order.ownerData?.location?.lat !== null &&
      order.ownerData?.location?.lng !== undefined &&
      order.ownerData?.location?.lng !== null;
    const hasValidIban = !!order.ownerData?.iban;
    return NextResponse.json({
      success: true,
      data: {
        waffyStatus,
        hasValidLocation,
        hasValidIban,
        waffyAddress: order.ownerData?.waffyAddress,
        orderStatus: order.status,
        milestones,
        lastCashoutEmailSent: order.lastCashoutEmailSent,
      },
    });
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: `/api/orders/${id}/waffy`,
      method: "GET",
    });
  }
}
export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    if (!user || user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }
    const { id } = await params;
    const body = await req.json();
    const { action, customAmounts } = body;
    const order = await Order.findById(id)
      .populate("ownerData")
      .populate("userData.id", "waffyId");
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }
    if (action === "email") {
      const ownerLang = order.ownerData?.lang || "ar";
      await sendCashoutRequirementsEmail(
        order.ownerData.email,
        order.ownerData.fullName,
        ownerLang,
      );
      await Order.findByIdAndUpdate(order._id, {
        $set: { lastCashoutEmailSent: new Date() },
      });
      return NextResponse.json({ success: true, message: "Email sent" });
    }
    if (action === "ACCEPT_CONTRACT") {
      // Check requirements
      const hasValidLocation =
        order.ownerData?.location?.lat !== undefined &&
        order.ownerData?.location?.lat !== null &&
        order.ownerData?.location?.lng !== undefined &&
        order.ownerData?.location?.lng !== null;
      const hasValidIban = !!order.ownerData?.iban;

      if (!hasValidLocation || !hasValidIban) {
        throw new Error("Missing requirements: Location or IBAN");
      }
      if (!order.ownerData?.waffyAddress && hasValidLocation) {
        await handleUserAddress(
          order.ownerData.location,
          order.ownerData.waffyId,
          order.ownerData._id,
        );
      }
      const res = await waffyContract.handelContract({
        milestoneId: order.milestoneId,
      });

      if (!res.success)
        throw new Error(res.error || "Failed to accept contract");
      return NextResponse.json({ success: true, message: "Contract accepted" });
    }
    if (action === "SETTLE_CONTRACT") {
      let adminAmount, ownerAmount, customerAmount;

      if (
        customAmounts &&
        customAmounts.platform !== undefined &&
        customAmounts.owner !== undefined &&
        customAmounts.customer !== undefined
      ) {
        // Custom distribution provided by admin
        adminAmount = +Number(customAmounts.platform).toFixed(2);
        ownerAmount = +Number(customAmounts.owner).toFixed(2);
        customerAmount = +Number(customAmounts.customer).toFixed(2);
        const total = +(adminAmount + ownerAmount + customerAmount).toFixed(2);
        if (Math.abs(total - order.totalAmount) > 1) {
          return NextResponse.json(
            {
              success: false,
              error: `مجموع التوزيع (${total}) لا يتطابق مع إجمالي الطلب (${order.totalAmount})`,
            },
            { status: 400 },
          );
        }
      } else {
        // Default formula
        const totalWithoutTax = order.totalAmount - order.tax;
        const adminCommission = (order.ownerData?.commission || 15) / 100;
        const adminWithoutTax = totalWithoutTax * adminCommission;
        const adminTax = adminWithoutTax * 0.15;
        adminAmount = +(adminWithoutTax + adminTax).toFixed(0);
        ownerAmount = order.totalAmount - adminAmount;
        customerAmount = 0;
      }

      await Order.findByIdAndUpdate(order._id, { ownerAmount });

      const customerWaffyId = order.userData?.id?.waffyId || null;

      const res = await waffyContract.settleContract({
        milestoneId: order.milestoneId,
        providerId: order.ownerData.waffyId,
        receiverId: order.ownerData.waffyId,
        receiverAmount: ownerAmount,
        adminAmount,
        customerAmount,
        customerId: customerWaffyId,
      });
      if (!res.success)
        throw new Error(res.error || "Failed to settle contract");
      return NextResponse.json({ success: true, message: "Contract settled" });
    }
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    const { id } = await params;
    return handleApiError(error, {
      endpoint: `/api/orders/${id}/waffy`,
      method: "POST",
    });
  }
}
