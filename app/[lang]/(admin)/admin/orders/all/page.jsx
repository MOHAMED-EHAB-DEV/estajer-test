import React from "react";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import AllOrdersContainer from "@/components/admin/orders/AllOrdersContainer";

const getOrdersData = async (searchParams) => {
  try {
    const apiParams = new URLSearchParams();
    apiParams.set("requests", "true");
    apiParams.set("showAll", "true");
    apiParams.set("limit", "20");
    apiParams.set("unPaid", "true");
    if (searchParams?.date) apiParams.set("date", searchParams.date);
    if (searchParams?.startDate)
      apiParams.set("startDate", searchParams.startDate);
    if (searchParams?.endDate) apiParams.set("endDate", searchParams.endDate);
    if (searchParams?.status) apiParams.set("status", searchParams.status);
    if (searchParams?.search) apiParams.set("id", searchParams.search);
    if (searchParams?.ownerSearch)
      apiParams.set("ownerSearch", searchParams.ownerSearch);
    if (searchParams?.customerSearch)
      apiParams.set("customerSearch", searchParams.customerSearch);
    if (searchParams?.provider)
      apiParams.set("provider", searchParams.provider);
    if (searchParams?.page) apiParams.set("page", searchParams.page);
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders?${apiParams}`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [], totalOrders: 0, totalPages: 1, currentPage: 1 };
  }
};

export default async function page({ params, searchParams }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const queryParams = await searchParams;
  const orderData = await getOrdersData(queryParams || {});

  return (
    <div className="flex flex-col gap-3 md:gap-5 md:px-4">
      <div className="flex items-center gap-4 mt-2 md:mt-6 mb-1 md:mb-2">
        <div>
          <h1 className="text-base md:text-xl lg:text-2xl font-bold text-darkNavy">
            {translate("dashboard.requests.title")}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5 font-NotoSansArabic">
            تتبع وإدارة جميع طلبات الاستئجار في المنصة
          </p>
        </div>
      </div>
      <AllOrdersContainer
        translate={translate()}
        langPrefix={langPrefix}
        lang={lang}
        isAll={true}
        orders={orderData.orders}
        totalOrders={orderData.totalOrders}
        totalPages={orderData.totalPages}
        currentPage={orderData.currentPage}
        queryParams={queryParams}
      />
    </div>
  );
}
