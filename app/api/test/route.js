import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import waffyContract from "@/lib/waffy-contract";

export async function GET() {
  // await connectDB();
  // const readyForCashOutOrders = await Order.find({
  //   ownerData: "6978e53ce9446f875c8ba861",
  //   waffyStatus: "CASH_OUT_APPROVED",
  // })
  //   .populate("ownerData")
  //   .populate("userData.id");
  // for (const order of readyForCashOutOrders) {
  //   try {
  //     const totalWithoutTax = order.totalAmount - order.tax;
  //     console.log("order.totalAmount: ", order.totalAmount);
  //     const adminCommission = (order.ownerData?.commission || 15) / 100;
  //     const adminWithoutTax = totalWithoutTax * adminCommission;
  //     const adminTax = adminWithoutTax * 0.15;
  //     const adminAmount = +(adminWithoutTax + adminTax).toFixed(0);

  //     await waffyContract.settleContract({
  //       milestoneId: order.milestoneId,
  //       providerId: order.ownerData.waffyId,
  //       receiverId: order.ownerData.waffyId,
  //       receiverAmount: 0,
  //       adminAmount: order.totalAmount,
  //     });
  //   } catch (error) {
  //     console.error("Error processing order:", error);
  //   }
  // }
  // const product = await Product.findById("");

  return NextResponse.json({});
}
