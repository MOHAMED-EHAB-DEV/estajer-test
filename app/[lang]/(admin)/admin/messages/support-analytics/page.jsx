import { cookies } from "next/headers";
import SupportAnalyticsClient from "@/components/admin/support/SupportAnalyticsClient";

const getAnalytics = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/support/analytics`,
      { headers: { Authorization: token }, cache: "no-store" },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export default async function SupportAnalyticsPage({ params }) {
  const { lang } = await params;
  const data = await getAnalytics();

  if (!data) {
    return (
      <div className="p-12 text-center text-gray-400">
        {lang === "ar" ? "فشل تحميل البيانات" : "Failed to load analytics data"}
      </div>
    );
  }

  return <SupportAnalyticsClient initialData={data} lang={lang} />;
}
