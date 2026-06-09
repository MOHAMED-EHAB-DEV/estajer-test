import React from "react";
import { cookies } from "next/headers";
import OrdersList from "@/components/dashboard/OrdersList";
import { getTranslations } from "@/hooks/getTranslations";

const getOrdersData = async (searchParams) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const params = new URLSearchParams(searchParams);
    params.append("requests", "true");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders?${params.toString()}`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [] };
  }
};

export default async function page({ params, searchParams }) {
  const { lang } = await params;
  const sParams = await searchParams;
  const t = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const orderData = await getOrdersData(sParams);

  return (
    <div>
      <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-semibold md:mb-6 mb-2">
        {t("dashboard.requests.title")}
      </h1>
      <OrdersList
        langPrefix={langPrefix}
        orders={orderData.orders}
        lang={lang}
        isOwner={true}
        translate={t()}
      />
    </div>
  );
}
