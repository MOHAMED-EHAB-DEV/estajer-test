import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";
import AdminContainer from "@/components/admin/AdminContainer";

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
  const queryParams = await searchParams;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const ordersData = await getOrdersData();

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl md:text-2xl text-lg font-semibold md:mt-4 md:mb-6 mb-2">
          {translate("admin.home.title")}
        </h1>
      </div>
      <AdminContainer
        langPrefix={langPrefix}
        translate={translate}
        lang={lang}
        queryParams={queryParams}
        orders={ordersData.orders}
      />
    </div>
  );
}
