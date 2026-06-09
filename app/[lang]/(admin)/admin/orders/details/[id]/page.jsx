import { cookies } from "next/headers";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import OrderDetails from "@/components/admin/orders/OrderDetails";
import { NotFoundContent } from "@/app/not-found";

const getOrderData = async (orderId) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}?details=true`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

const Page = async ({ params }) => {
  const { lang, id: orderId } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const orderData = await getOrderData(orderId);
  if (!orderData) return <NotFoundContent lang={lang} />;
  return (
    <div className="flex flex-col gap-3 md:gap-5 px-1 md:px-4 pt-4 md:pt-8">
      <TitleWithSegments
        title={translate("titles.details")}
        translate={translate()}
      />
      <OrderDetails order={orderData} />
    </div>
  );
};
export default Page;
