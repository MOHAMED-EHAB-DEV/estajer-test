import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import PremiumOrdersContainer from "@/components/admin/premium-orders/PremiumOrdersContainer";

export const dynamic = "force-dynamic";

const getPremiumOrders = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/premium-orders`,
      {
        method: "GET",
        headers: { Authorization: token },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch premium orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching premium orders:", error);
    return {
      success: false,
      orders: [],
      groupedOrders: [],
    };
  }
};

export default async function AdminPremiumOrdersPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const initialData = await getPremiumOrders();

  return (
    <div className="min-h-screen bg-lightBg animate-in fade-in duration-300">
      <div className="space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-[#F97316] rounded-2xl flex items-center justify-center shadow-md">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-NotoSansArabic leading-tight">
              {t("admin.premiumOrders.title")}
            </h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">
              {t("admin.premiumOrders.subtitle")}
            </p>
          </div>
        </div>

        {/* Content Container */}
        <PremiumOrdersContainer
          initialData={initialData}
          translate={t()}
          lang={lang}
        />
      </div>
    </div>
  );
}
