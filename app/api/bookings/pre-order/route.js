import { authenticateUser } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import PreOrder from "@/models/PreOrder";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { differenceInDays } from "date-fns";
import { handleApiError } from "@/lib/errorHandler";
import { authHeaders } from "@/middleware/authHeaders";

const isDateRangeValidForBooking = (tier, order) => {
  // If the tier has no date restrictions, it's always valid.
  if (!tier.dateRanges || tier.dateRanges.length === 0) return true;
  // Convert booking dates to Date objects for reliable comparison.
  const bookingStart = new Date(order.startDate);
  const bookingEnd = new Date(order.endDate);
  // Check if the booking period falls within ANY of the allowed date ranges.
  return tier.dateRanges.some((range) => {
    // A range must have 'from' and 'to' dates to be considered.
    if (!range.from || !range.to) return false;
    const rangeStart = new Date(range.from);
    const rangeEnd = new Date(range.to);
    // The entire booking period must be contained within the discount range.
    return bookingStart >= rangeStart && bookingEnd <= rangeEnd;
  });
};

export async function POST(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");
    const user = client ? await authenticateUser() : await authHeaders(req);
    const { cartItems } = await req.json();

    if (user._id.toString() === cartItems[0].ownerId)
      throw new Error("لا يمكنك حجز المنتجات التي تمتلكها");

    // Validate that all items have the same start and end dates
    const firstItem = cartItems[0];
    const hasConsistentDates = cartItems.every(
      (item) =>
        new Date(item.startDate).getTime() ===
          new Date(firstItem.startDate).getTime() &&
        new Date(item.endDate).getTime() ===
          new Date(firstItem.endDate).getTime(),
    );

    if (!hasConsistentDates) {
      throw new Error(
        "يجب أن تكون تواريخ البدء والانتهاء متطابقة لجميع المنتجات في السلة",
      );
    }

    // Validate future dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Validate all orders and get fresh product data
    const validatedOrders = await Promise.all(
      cartItems.map(async (item) => {
        const startDate = new Date(item.startDate);
        // if (startDate < tomorrow) {
        //   throw new Error(
        //     `يجب أن يكون تاريخ بدء الحجز بعد يوم ${tomorrow.toLocaleDateString(
        //       "ar",
        //       { year: "numeric", month: "long", day: "2-digit" }
        //     )}`
        //   );
        // }

        // Get fresh product data
        const [product, conflictingBookings] = await Promise.all([
          Product.findById(item.product._id).populate(
            "owner",
            "fullName phone companyDetails.taxCode holidayPeriods",
          ),
          Booking.find({
            product: item.product._id,
            status: { $in: ["confirmed", "pending"] },
            $or: [
              {
                startDate: { $lte: item.endDate },
                endDate: { $gte: item.startDate },
              },
            ],
          }),
        ]);

        if (!product) throw new Error(`المنتج ${item.product.name} غير متوفر`);

        // Check if dates conflict with owner's holiday periods
        const ownerHolidays = product.owner?.holidayPeriods || [];
        if (ownerHolidays.length > 0) {
          const itemStart = new Date(item.startDate);
          const itemEnd = new Date(item.endDate);
          itemStart.setHours(0, 0, 0, 0);
          itemEnd.setHours(23, 59, 59, 999);

          const hasHolidayConflict = ownerHolidays.some((h) => {
            const hStart = new Date(h.from);
            const hEnd = new Date(h.to);
            hStart.setHours(0, 0, 0, 0);
            hEnd.setHours(23, 59, 59, 999);
            return itemStart <= hEnd && itemEnd >= hStart;
          });

          if (hasHolidayConflict) {
            throw new Error(
              `المنتج ${product.nameAr || product.name} غير متوفر للإيجار خلال هذه الفترة بسبب إجازة المالك`,
            );
          }
        }

        // Verify services exist and get fresh prices
        const validatedServices = item.selectedServices.map((service) => {
          const productService = product.services.find(
            (s) => s.id === service.id,
          );
          if (!productService)
            throw new Error(
              `الخدمة ${service.name} غير متوفرة للمنتج ${item.product.name}`,
            );
          return { ...service, price: productService.price };
        });

        // Calculate total booked quantity for the period
        const bookedQuantity = conflictingBookings.reduce(
          (sum, booking) => sum + booking.quantity,
          0,
        );

        // Check if requested quantity + booked quantity exceeds product quantity
        if (
          bookedQuantity + item.quantity > product.quantity &&
          product.pricingModel !== "packages"
        ) {
          const availableQuantity = product.quantity - bookedQuantity;
          if (availableQuantity <= 0) {
            throw new Error(`${product.nameAr} غير متاح فى التواريخ المحددة`);
          } else {
            throw new Error(
              `${product.nameAr} متوفر فقط ${availableQuantity} قطع فى التواريخ المحددة`,
            );
          }
        }

        return { ...item, product, selectedServices: validatedServices };
      }),
    );

    // Create bookings with verified prices
    const bookingsPromises = validatedOrders.map(async (order) => {
      const days = differenceInDays(order.endDate, order.startDate) + 1;

      const productPrice =
        order.product.pricingModel !== "packages"
          ? order.product.rental.value * days * order.quantity
          : order.product.rental.packages.find(
              (pkg) => pkg._id.toString() === order.selectedPackage?._id,
            ).price * order.quantity;

      // Calculate services cost with verified prices
      const servicesPrice = order.selectedServices.reduce(
        (total, service) => {
          const lineTotal = service.price * service.quantity;
          return (
            total +
            (service.pricingType === "fixed" ? lineTotal : lineTotal * days)
          );
        },
        0,
      );

      let durationDiscount = 0;
      if (
        order.product.rental.discountTiers &&
        order.product.rental.discountTiers.length > 0 &&
        order.product.pricingModel !== "packages"
      ) {
        const sortedTiers = [...order.product.rental.discountTiers].sort(
          (a, b) => b.minDays - a.minDays,
        );
        for (const tier of sortedTiers) {
          // A discount applies if days are sufficient AND the date range is valid.
          if (days >= tier.minDays && isDateRangeValidForBooking(tier, order)) {
            durationDiscount = productPrice * (tier.discount / 100);
            break; // Apply the highest valid discount and stop.
          }
        }
      }

      let qtyDiscountMult = 0;
      if (
        order.product.rental.quantityDiscountTiers &&
        order.product.rental.quantityDiscountTiers.length > 0 &&
        order.product.pricingModel !== "packages"
      ) {
        const sortedQtyTiers = [
          ...order.product.rental.quantityDiscountTiers,
        ].sort((a, b) => b.minQuantity - a.minQuantity);
        for (const tier of sortedQtyTiers) {
          if (order.quantity >= tier.minQuantity) {
            qtyDiscountMult = tier.discount / 100;
            break;
          }
        }
      }

      const priceWithDurationDiscount = productPrice - durationDiscount;
      const finalProductPrice =
        priceWithDurationDiscount * (1 - qtyDiscountMult);
      const totalDiscount = productPrice - finalProductPrice;

      const priceWithServices = finalProductPrice + servicesPrice;
      const totalPrice = priceWithServices;

      // Calculate tax (15% of price after discount) - only if owner has taxCode
      const hasTaxCode = !!order.product.owner?.companyDetails?.taxCode;
      const taxAmount = hasTaxCode ? totalPrice * 0.15 : 0;

      return {
        booking: await Booking.create({
          user: user._id,
          product: order.product._id,
          startDate: order.startDate,
          endDate: order.endDate,
          quantity: order.quantity,
          price: priceWithServices,
          discount: totalDiscount,
          services: order.selectedServices,
          deliveryType: order.deliveryType,
          selectedBranch: order.selectedBranch,
        }),
        price: totalPrice,
        tax: taxAmount,
        insurance: order.product.rental.insurance,
      };
    });

    const bookingsResults = await Promise.all(bookingsPromises);

    // Calculate totals
    const orderPrice = bookingsResults.reduce((s, { price }) => s + price, 0);
    const totalTax = bookingsResults.reduce((s, { tax }) => s + tax, 0);
    const totalInsurance = bookingsResults.reduce(
      (sum, { insurance }) => sum + insurance,
      0,
    );

    // Create pre-order without user data
    const preOrderData = {
      userId: user._id,
      ownerData: validatedOrders[0].product.owner._id,
      items: bookingsResults.map(({ booking }) => booking._id),
      cartItems: cartItems.map((item) => ({ id: item.id })),
      startDate: validatedOrders[0].startDate,
      endDate: validatedOrders[0].endDate,
      price: +orderPrice.toFixed(0),
      tax: +totalTax.toFixed(0),
      insurance: +totalInsurance.toFixed(0),
      totalAmount: +orderPrice.toFixed(0),
      providerId: cartItems[0]?.providerId || null,
    };

    const preOrder = await PreOrder.create(preOrderData);

    return NextResponse.json({
      success: true,
      data: {
        preOrderId: preOrder._id,
        price: orderPrice.toFixed(0),
        tax: totalTax.toFixed(0),
        insurance: totalInsurance.toFixed(0),
        totalAmount: orderPrice.toFixed(0),
        itemsCount: bookingsResults.length,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/bookings/pre-order",
      method: "POST",
      req,
      requestBody: { ...req.body, user: { _id: "REDACTED" } }, // Avoid sending full user
    });
  }
}
