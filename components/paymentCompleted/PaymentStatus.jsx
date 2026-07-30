"use client";

import { useEffect, useRef, useState } from "react";
import PaidSection from "@/components/paymentCompleted/PaidSection";
import PaymentError from "@/components/paymentCompleted/PaymentError";
import { notFound } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { sendGTMEvent } from "@next/third-parties/google";
import PaymentProcessing from "./PaymentProcessing";
import { differenceInDays } from "date-fns";

async function confirmPayment({ id }) {
  try {
    const response = await fetch(`/api/payment-status?client=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, full: true }),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

export default function PaymentStatus({ id, lang, langPrefix, translate }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const purchaseSentRef = useRef(false);

  useEffect(() => {
    confirmPayment({ id }).then((data) => {
      setPayment(data);
      setLoading(false);
    });
  }, [id]);

  // Send purchase event once when order is confirmed and pending
  useEffect(() => {
    if (!payment || purchaseSentRef.current) return;
    const order = payment?.order ? payment.order : payment;
    if (order?.status === "pending") {
      const transactionId = order?._id || order?.orderId;
      if (transactionId) {
        try {
          const trackedPurchases = JSON.parse(
            localStorage.getItem("tracked_purchases") || "[]",
          );
          if (trackedPurchases.includes(transactionId)) {
            purchaseSentRef.current = true;
            return;
          }
        } catch (_) {}
      }

      purchaseSentRef.current = true;
      try {
        const items = Array.isArray(order?.items)
          ? order.items.map((item) => {
              const p = item?.product || {};
              const priceCandidate =
                item?.price ?? item?.rental?.value ?? item?.totalPrice ?? 0;
              return {
                item_id: p?._id || item?.productId || item?._id,
                item_name:
                  p?.nameEn || p?.nameAr || p?.name || p?.title || "product",
                item_category: p?.category || undefined,
                item_category2: p?.subCategory || undefined,
                quantity: item?.quantity ?? 1,
                price: Number(priceCandidate) || 0,

                days:
                  item?.endDate && item?.startDate
                    ? differenceInDays(
                        new Date(item.endDate),
                        new Date(item.startDate),
                      ) + 1
                    : 1,
                city:
                  lang === "en"
                    ? p?.addressEn?.city || p?.addressAr?.city
                    : p?.addressAr?.city || p?.addressEn?.city,
                currency: "SAR",
                seller_name: order.ownerData?.fullName,
              };
            })
          : [];

        sendGTMEvent({
          event: "purchase",
          ecommerce: {
            transaction_id: transactionId,
            value:
              Number(order?.totalAmount ?? order?.totalPrice ?? order?.total) ||
              0,
            currency: "SAR",
            shipping: Number(order?.deliveryCost) || 0,
            tax: Number(order?.taxAmount || order?.tax || order?.totalTax) || 0,
            discount:
              order?.items?.reduce(
                (sum, item) => sum + (item.discount || 0),
                0,
              ) || 0,
            items,
          },
          delivery_type: order?.items?.[0]?.deliveryType || "none",
          payment_provider: "Waffy",
          payment_url: order?.paymentUrl || undefined,
        });

        // Save transactionId to localStorage to prevent duplicate tracking
        if (transactionId) {
          try {
            let trackedPurchases = JSON.parse(
              localStorage.getItem("tracked_purchases") || "[]",
            );
            if (!trackedPurchases.includes(transactionId)) {
              trackedPurchases.push(transactionId);
              trackedPurchases = trackedPurchases.slice(-5);
              localStorage.setItem(
                "tracked_purchases",
                JSON.stringify(trackedPurchases),
              );
            }
          } catch (_) {}
        }
      } catch {}
    }
  }, [payment]);

  if (loading)
    return (
      <div className="h-[75vh] w-full flex items-center justify-center text-3xl">
        <Spinner size="lg" />
      </div>
    );

  if (!payment) notFound();
  const status = payment?.order ? payment.order.status : payment.status;
  return (
    <div className="max-w-screen-xl md:gap-10 mx-auto px-8 py-16 md:min-h-[85vh] flex flex-wrap items-center justify-center">
      {status === "pending" || status === "confirmed" ? (
        <PaidSection langPrefix={langPrefix} translate={translate} />
      ) : status === "PAYMENT_PROCESSING" ? (
        <PaymentProcessing langPrefix={langPrefix} translate={translate} />
      ) : status === "not-paid" ? (
        <PaymentError
          langPrefix={langPrefix}
          translate={translate}
          paymentUrl={payment?.order?.paymentUrl || payment?.paymentUrl}
        />
      ) : (
        notFound()
      )}
    </div>
  );
}
