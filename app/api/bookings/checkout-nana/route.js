import connectDB from "@/lib/db";
import Order from "@/models/Order";
import PreOrder from "@/models/PreOrder";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";
import calculateDistance from "@/utils/calculateDistance";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

// Helper function to calculate delivery cost based on pricing model
const calculateDeliveryCostAPI = (product, userLocation, userAddressData) => {
  if (!product?.rental?.delivery || product.rental.delivery.type !== "delivery")
    return 0;

  const delivery = product.rental.delivery;

  // Per-kilometer pricing (default)
  if (!delivery.pricingModel || delivery.pricingModel === "perKm") {
    const productLocation = {
      lng: product.location?.coordinates[0],
      lat: product.location?.coordinates[1],
    };
    const distance = calculateDistance(
      productLocation.lat,
      productLocation.lng,
      userLocation.lat,
      userLocation.lng,
    );
    return distance * (delivery.cost || 0);
  }

  // Fixed city pricing
  if (delivery.pricingModel === "fixedCity" && delivery.fixedCityPricing) {
    // Extract city from user address (this is a simple approach)
    const cityLower = userAddressData?.city?.toLowerCase() || "";

    // First, try to find exact city match
    const matchingCity = delivery.fixedCityPricing.find((cityPricing) => {
      if (cityPricing.isGovernorate) return false;
      const cityArLower = cityPricing.cityAr?.toLowerCase() || "";
      const cityEnLower = cityPricing.cityEn?.toLowerCase() || "";

      return cityLower.includes(cityArLower) || cityLower.includes(cityEnLower);
    });

    if (matchingCity) return matchingCity.price || 0;
    const governorateLower = userAddressData?.governorate?.toLowerCase() || "";
    // If no city match, try to find governorate match
    const matchingGovernorate = delivery.fixedCityPricing.find(
      (cityPricing) => {
        if (!cityPricing.isGovernorate) return false;
        const governorateArLower =
          cityPricing.governorateAr?.toLowerCase() || "";
        const governorateEnLower =
          cityPricing.governorateEn?.toLowerCase() || "";

        return (
          governorateLower.includes(governorateArLower) ||
          governorateLower.includes(governorateEnLower)
        );
      },
    );

    if (matchingGovernorate) return matchingGovernorate.price || 0;

    // If no matching city or governorate found, delivery is not available
    return -1; // Special value to indicate delivery not available
  }
  return 0;
};

export async function POST(req) {
  try {
    await connectDB();
    const user = await authHeaders(req);
    const { userData, preOrderId, token } = await req.json();
    if (!preOrderId)
      return NextResponse.json(
        { error: "Pre-order ID is required,Please Refresh The Page" },
        { status: 400 },
      );

    // Handle pre-order flow for better performance
    const preOrder = await PreOrder.findOne({
      _id: preOrderId,
      userId: user._id,
      status: "pending",
    }).populate(
      "ownerData",
      "fullName phone commission companyDetails.taxCode",
    );

    if (!preOrder)
      return NextResponse.json(
        { error: "Pre-order not found or expired" },
        { status: 404 },
      );

    // Check if user has addressDetails, if not add default structure
    if (!user?.location?.lat) {
      await User.findByIdAndUpdate(user._id, {
        address: userData.address,
        location: userData.location,
      });
    }

    // Calculate delivery cost for each item and update bookings
    let totalDeliveryCost = 0;
    const deliveryCosts = [];
    for (const item of preOrder.items) {
      let itemDeliveryCost = 0;
      if (item.deliveryType !== "receive" && !item.selectedBranch?.name) {
        itemDeliveryCost = calculateDeliveryCostAPI(
          item.product,
          userData?.location,
          userData?.addressData,
        );
      }
      totalDeliveryCost += itemDeliveryCost;
      deliveryCosts.push({
        bookingId: item._id,
        deliveryCost: itemDeliveryCost,
      });
      // Update the booking with delivery cost
      await Booking.findByIdAndUpdate(item._id, {
        deliveryCost: +itemDeliveryCost.toFixed(0),
      });
    }

    // Recalculate tax to include delivery cost (like in frontend)
    // Use the pre-order tax which already accounts for taxCode status
    // Only add delivery cost tax if owner has taxCode
    const ownerHasTaxCode = !!preOrder.ownerData?.companyDetails?.taxCode;
    const deliveryTax = ownerHasTaxCode
      ? +totalDeliveryCost.toFixed(0) * 0.15
      : 0;
    const tax = preOrder.tax + deliveryTax;

    const paymentUrl = await fetch("https://miniapps.nana.sa/api/v2/mobile-user-activities/create-payment-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "miniapp-api-key": process.env.MINIAPP_API_KEY,
        "miniapp-user-token": `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: +(preOrder.totalAmount + tax + totalDeliveryCost).toFixed(0),
        reference: preOrder._id.toString(),
      }),
    }).then((res) => res.json());
    if (!paymentUrl.success)
      throw new Error(paymentUrl.error_message || paymentUrl || "Failed to create payment page");
    // Create order using pre-calculated data
    const order = await Order.create({
      paymentId: paymentUrl.data.id,
      paymentGateway: "nana",
      userData,
      ownerData: preOrder.ownerData,
      items: preOrder.items,
      startDate: preOrder.startDate,
      endDate: preOrder.endDate,
      price: +preOrder.price.toFixed(0),
      tax: +tax.toFixed(0),
      insurance: preOrder.insurance,
      deliveryCost: +totalDeliveryCost.toFixed(0),
      totalAmount: +(preOrder.totalAmount + tax + totalDeliveryCost).toFixed(0),
    });

    // Mark pre-order as used
    preOrder.status = "used";
    await preOrder.save();

    return NextResponse.json({
      success: true,
      data: paymentUrl.data,
      order,
      customerToken: paymentUrl.customerToken,
      id: paymentUrl.data.id,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/bookings/checkout",
      method: "POST",
      req,
    });
  }
}
