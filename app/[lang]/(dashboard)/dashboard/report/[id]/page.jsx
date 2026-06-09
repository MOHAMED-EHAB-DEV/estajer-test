import { getTranslations } from "@/hooks/getTranslations";
import DamageReportForm from "@/components/dashboard/DamageReportForm";
import { cookies } from "next/headers";
import { NotFoundContent } from "@/app/not-found";

// Server-side function to get order data
const getOrderData = async (orderId) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${orderId}`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) return null;

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export default async function DamageReportPage({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";

  // Get order data
  const order = await getOrderData(id);

  if (
    !order ||
    !["completed", "received", "confirmed"].includes(order.status)
  ) {
    return <NotFoundContent lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <DamageReportForm
        order={order}
        translate={translate()}
        lang={lang}
        langPrefix={langPrefix}
      />
    </div>
  );
}
