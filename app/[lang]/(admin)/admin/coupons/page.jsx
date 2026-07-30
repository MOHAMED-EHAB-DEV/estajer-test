import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import CouponsContainer from "@/components/admin/coupons/CouponsContainer";

export const dynamic = "force-dynamic";

const getCoupons = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/coupons`,
      {
        method: "GET",
        headers: { Authorization: token || "" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch coupons");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return {
      success: false,
      coupons: [],
    };
  }
};

export default async function AdminCouponsPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const initialData = await getCoupons();

  return (
    <div className="min-h-screen bg-lightBg animate-in fade-in duration-300">
      <div className="space-y-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 md:p-8 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-[#F97316] rounded-2xl flex items-center justify-center shadow-md">
            {/* Coupon icon */}
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-NotoSansArabic leading-tight">
              {t("admin.coupons.title")}
            </h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">
              {t("admin.coupons.subtitle")}
            </p>
          </div>
        </div>

        {/* Content Container */}
        <CouponsContainer
          initialData={initialData}
          translate={t()}
          lang={lang}
        />
      </div>
    </div>
  );
}
