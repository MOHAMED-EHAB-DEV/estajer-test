import { CronJob } from "cron";
import connectDB from "../db";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendCashoutRequirementsEmail } from "../email";
import waffyContract from "../waffy-contract";
import waffyAuth from "../waffy-auth";

let contractJob = null;
let orderRejectionJob = null;
let unfinishedContractsJob = null;

// Helper function to handle address creation from geocoding
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

  // Extract address components
  const addressData = {
    addressLabel: "HOME",
    street: "",
    district: "",
    postalCode: "",
    city: "",
    countryCode: "SA",
  };

  // Parse address components
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

export const startContractHandling = () => {
  if (contractJob) {
    console.log("Stopping existing contract handling cron job");
    contractJob.stop();
  }

  // Run daily at 7 AM
  contractJob = new CronJob(
    "0 7 * * *",
    async () => {
      try {
        await connectDB();
        console.log("Running contract handling job...");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Contract handling job - today: ", today);

        const completeOrders = await Order.find({
          waffyStatus: "PAID",
          status: { $in: ["completed", "received"] },
          endDate: { $lt: today },
        })
          .populate("ownerData")
          .populate("userData.id");

        if (completeOrders.length === 0)
          return console.log("No completed orders to process");

        console.log(
          `Found ${completeOrders.length} completed orders to process`,
        );

        // Group orders by owner to send only one email per owner
        const ordersByOwner = new Map();
        const ownersWithMissingRequirements = new Set();

        for (const order of completeOrders) {
          const ownerId = order.ownerData._id.toString();

          if (!ordersByOwner.has(ownerId)) ordersByOwner.set(ownerId, []);

          ordersByOwner.get(ownerId).push(order);

          // Check if owner has valid location and IBAN
          const hasValidLocation =
            order.ownerData?.location?.lng !== undefined &&
            order.ownerData?.location?.lng !== null;
          const hasValidIban = !!order.ownerData?.iban;

          if (!hasValidLocation || !hasValidIban)
            ownersWithMissingRequirements.add(ownerId);
          if (!order.ownerData?.waffyAddress && hasValidLocation) {
            await handleUserAddress(
              order.ownerData.location,
              order.ownerData.waffyId,
              order.ownerData._id,
            );
          }
        }

        // Send one email per owner with missing requirements
        for (const ownerId of ownersWithMissingRequirements) {
          const ownerOrders = ordersByOwner.get(ownerId);
          const firstOrder = ownerOrders[0]; // Use first order to get owner data
          const ownerLang = firstOrder.ownerData?.lang || "ar";

          try {
            await sendCashoutRequirementsEmail(
              firstOrder.ownerData.email,
              firstOrder.ownerData.fullName,
              ownerLang,
            );
            console.log(`Sent cashout requirements email to owner ${ownerId}`);
          } catch (emailError) {
            console.error(
              `Failed to send cashout requirements email to owner ${ownerId}:`,
              emailError,
            );
          }
        }

        // Process contract handling for orders with valid requirements
        let processedContracts = 0;
        for (const order of completeOrders) {
          const ownerId = order.ownerData._id.toString();

          // Skip orders with missing requirements
          if (ownersWithMissingRequirements.has(ownerId)) continue;

          try {
            await waffyContract.handelContract({
              milestoneId: order.milestoneId,
            });
            console.log(`Processed contract for order ${order._id}`);
            processedContracts++;
          } catch (contractError) {
            console.error(
              `Failed to handle contract for order ${order._id}:`,
              contractError,
            );
          }
        }

        console.log(
          `Contract handling completed: ${processedContracts} contracts processed, ${ownersWithMissingRequirements.size} owners notified about missing requirements`,
        );
      } catch (error) {
        console.error("Contract handling cron job error:", error);
      }
    },
    null,
    true,
    "Asia/Riyadh",
  );

  contractJob.start();
  console.log("Contract handling cron job started (7 AM daily)");
};

// export const startOrderRejection = () => {
//   if (orderRejectionJob) {
//     console.log("Stopping existing order rejection cron job");
//     orderRejectionJob.stop();
//   }

//   // Run daily at 8 AM
//   orderRejectionJob = new CronJob(
//     "0 8 * * *",
//     async () => {
//       try {
//         await connectDB();
//         console.log("Running order rejection job...");

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         console.log("Order rejection job - today: ", today);

//         // Find orders that have passed their start date and are still pending or confirmed
//         const expiredOrders = await Order.find({
//           status: { $in: ["pending", "confirmed"] },
//           startDate: { $lt: today },
//         });

//         if (expiredOrders.length === 0) {
//           return console.log("No expired orders to reject");
//         }

//         console.log(`Found ${expiredOrders.length} expired orders to reject`);

//         let rejectedOrders = 0;
//         for (const order of expiredOrders) {
//           try {
//             // Reject the contract using waffy
//             await waffyContract.handelContract({
//               milestoneId: order.milestoneId,
//               action: "REJECT_CONTRACT",
//             });

//             // Update order status to rejecting
//             order.status = "rejecting";
//             await order.save();

//             console.log(`Rejected expired order ${order._id}`);
//             rejectedOrders++;
//           } catch (contractError) {
//             console.error(
//               `Failed to reject contract for order ${order._id}:`,
//               contractError
//             );
//           }
//         }

//         console.log(
//           `Order rejection completed: ${rejectedOrders} orders rejected`
//         );
//       } catch (error) {
//         console.error("Order rejection cron job error:", error);
//       }
//     },
//     null,
//     true,
//     "Asia/Riyadh"
//   );

//   orderRejectionJob.start();
//   console.log("Order rejection cron job started (daily at 8 AM)");
// };

export const startUnfinishedContracts = () => {
  if (unfinishedContractsJob) {
    console.log("Stopping existing unfinished contracts cron job");
    unfinishedContractsJob.stop();
  }

  // Run daily at 9 AM
  unfinishedContractsJob = new CronJob(
    "0 9 * * *",
    async () => {
      try {
        await connectDB();
        console.log("Running unfinished contracts job...");

        // Find orders with READY_FOR_CASH_OUT status
        const readyForCashOutOrders = await Order.find({
          waffyStatus: "READY_FOR_CASH_OUT",
        })
          .populate("ownerData")
          .populate("userData.id");

        console.log(
          `Found ${readyForCashOutOrders.length} orders ready for cash out`,
        );

        let processedCashOutOrders = 0;
        for (const order of readyForCashOutOrders) {
          try {
            const hasValidLocation =
              order.ownerData?.location?.lng !== undefined &&
              order.ownerData?.location?.lng !== null;
            const hasValidIban = !!order.ownerData?.iban;

            // If location or IBAN is missing, send notification email and prevent cash-out
            if (!hasValidLocation || !hasValidIban) {
              const ownerLang = order.ownerData?.lang || "ar";

              try {
                await sendCashoutRequirementsEmail(
                  order.ownerData.email,
                  order.ownerData.fullName,
                  ownerLang,
                );
                console.log(
                  `Sent cashout requirements email for order ${order._id}`,
                );
              } catch (emailError) {
                console.error(
                  "Failed to send cashout requirements email:",
                  emailError,
                );
              }
              continue;
            }

            // Proceed with existing cash-out logic if all requirements are met
            if (!order.ownerData?.waffyAddress && hasValidLocation) {
              await handleUserAddress(
                order.ownerData.location,
                order.ownerData.waffyId,
                order.ownerData._id,
              );
            }
            const totalWithoutTax = order.totalAmount - order.tax;
            const adminCommission = (order.ownerData?.commission || 15) / 100;
            const adminWithoutTax = totalWithoutTax * adminCommission;
            const adminTax = adminWithoutTax * 0.15;
            const adminAmount = +(adminWithoutTax + adminTax).toFixed(0);
            // update the order ownerAmount
            await Order.findByIdAndUpdate(order._id, {
              ownerAmount: order.totalAmount - adminAmount,
            });

            await waffyContract.settleContract({
              milestoneId: order.milestoneId,
              providerId: order.ownerData.waffyId,
              receiverId: order.ownerData.waffyId,
              receiverAmount: order.totalAmount - adminAmount,
              adminAmount,
            });

            console.log(`Processed cash out for order ${order._id}`);
            processedCashOutOrders++;
          } catch (contractError) {
            console.error(
              `Failed to process cash out for order ${order._id}:`,
              contractError,
            );
          }
        }

        // Find orders with REFUND_IN_PROGRESS status
        const refundInProgressOrders = await Order.find({
          waffyStatus: "REFUND_IN_PROGRESS",
        })
          .populate("ownerData")
          .populate("userData.id");

        console.log(
          `Found ${refundInProgressOrders.length} orders with refund in progress`,
        );

        let processedRefundOrders = 0;
        for (const order of refundInProgressOrders) {
          try {
            if (!order.userData?.id?.waffyAddress) {
              await handleUserAddress(
                order.userData.id.location,
                order.userData.id.waffyId,
                order.userData.id._id,
              );
            }

            await waffyContract.settleContract({
              milestoneId: order.milestoneId,
              providerId: order.ownerData.waffyId,
              receiverId: order.userData.id.waffyId,
              receiverAmount: order.totalAmount,
              adminAmount: 0,
            });

            console.log(`Processed refund for order ${order._id}`);
            processedRefundOrders++;
          } catch (contractError) {
            console.error(
              `Failed to process refund for order ${order._id}:`,
              contractError,
            );
          }
        }

        console.log(
          `Unfinished contracts job completed: ${processedCashOutOrders} cash-out orders processed, ${processedRefundOrders} refund orders processed`,
        );

        console.log("Running unfinished contract handling job...");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log("Unfinished Contract handling job - today: ", today);

        const completeOrders = await Order.find({
          waffyStatus: "PAID",
          status: { $in: ["completed", "received"] },
          endDate: { $lt: today },
        })
          .populate("ownerData")
          .populate("userData.id");

        if (completeOrders.length === 0)
          return console.log("No completed orders to process");

        console.log(
          `Found ${completeOrders.length} completed orders to process`,
        );

        // Process contract handling for orders with valid requirements
        let processedContracts = 0;
        for (const order of completeOrders) {
          try {
            const data = await waffyContract.getContractMilestones(
              order.contractId,
            );
            const status = data?.data?.content?.[0]?.status;
            if (status === "ACCEPTED" || status === "READY_FOR_CASH_OUT") {
              const hasValidLocation =
                order.ownerData?.location?.lng !== undefined &&
                order.ownerData?.location?.lng !== null;
              const hasValidIban = !!order.ownerData?.iban;

              // If location or IBAN is missing, send notification email and prevent cash-out
              if (!hasValidLocation || !hasValidIban) {
                const ownerLang = order.ownerData?.lang || "ar";

                try {
                  await sendCashoutRequirementsEmail(
                    order.ownerData.email,
                    order.ownerData.fullName,
                    ownerLang,
                  );
                  console.log(
                    `Sent cashout requirements email for order ${order._id}`,
                  );
                } catch (emailError) {
                  console.error(
                    "Failed to send cashout requirements email:",
                    emailError,
                  );
                }
                continue;
              }

              // Proceed with existing cash-out logic if all requirements are met
              if (!order.ownerData?.waffyAddress && hasValidLocation) {
                await handleUserAddress(
                  order.ownerData.location,
                  order.ownerData.waffyId,
                  order.ownerData._id,
                );
              }
              const totalWithoutTax = order.totalAmount - order.tax;
              const adminCommission = (order.ownerData?.commission || 15) / 100;
              const adminWithoutTax = totalWithoutTax * adminCommission;
              const adminTax = adminWithoutTax * 0.15;
              const adminAmount = +(adminWithoutTax + adminTax).toFixed(0);
              // update the order ownerAmount
              await Order.findByIdAndUpdate(order._id, {
                ownerAmount: order.totalAmount - adminAmount,
              });

              await waffyContract.settleContract({
                milestoneId: order.milestoneId,
                providerId: order.ownerData.waffyId,
                receiverId: order.ownerData.waffyId,
                receiverAmount: order.totalAmount - adminAmount,
                adminAmount,
              });
              console.log(`Processed contract for order ${order._id}`);
              processedContracts++;
            }
          } catch (contractError) {
            console.error(
              `Failed to handle contract for order ${order._id}:`,
              contractError,
            );
          }
        }

        console.log(
          `Unfinished contracts job completed: ${processedContracts} contracts processed`,
        );
      } catch (error) {
        console.error("Unfinished contracts cron job error:", error);
      }
    },
    null,
    true,
    "Asia/Riyadh",
  );

  unfinishedContractsJob.start();
  console.log("Unfinished contracts cron job started (daily at 9 AM)");
};
