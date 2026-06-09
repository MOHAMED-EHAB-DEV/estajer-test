import { getTranslations } from "@/hooks/getTranslations";
import OrdersContainer from "@/components/admin/orders/OrdersContainer";
import { cookies } from "next/headers";
import TitleWithSegments from "@/components/shared/TitleWithSegments";

const getOrdersData = async () => {
  try {
    const apiParams = new URLSearchParams();

    apiParams.set("requests", "true");
    apiParams.set("showAll", "true");
    apiParams.set("limit", "4");

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders?${apiParams}`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [] };
  }
};

export default async function Page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const ordersData = await getOrdersData();
  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        title={translate("admin.requests.title")}
        translate={translate()}
      />

      <OrdersContainer
        orders={ordersData.orders}
        translate={translate()}
        langPrefix={langPrefix}
        lang={lang}
      />
    </div>
  );
}
