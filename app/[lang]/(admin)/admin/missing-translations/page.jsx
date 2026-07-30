import { cookies } from "next/headers";
import MissingTranslationsContainer from "@/components/admin/missing-translations/MissingTranslationsContainer";

export const dynamic = "force-dynamic";

const getInitialData = async (searchParams) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiParams = new URLSearchParams();
    if (searchParams?.search) apiParams.set("search", searchParams.search);
    if (searchParams?.resolved) apiParams.set("resolved", searchParams.resolved);
    if (searchParams?.source) apiParams.set("source", searchParams.source);
    if (searchParams?.lang) apiParams.set("lang", searchParams.lang);
    if (searchParams?.page) apiParams.set("page", searchParams.page);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/admin/missing-translations?${apiParams}`,
      {
        method: "GET",
        headers: { Authorization: token || "" },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch missing translations");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching initial missing translations:", error);
    return {
      success: false,
      data: [],
      stats: {
        totalKeys: 0,
        totalOccurrences: 0,
        unresolvedCount: 0,
        resolvedCount: 0,
      },
      pagination: { page: 1, limit: 30, total: 0, totalPages: 1 },
    };
  }
};

export default async function AdminMissingTranslationsPage({ params, searchParams }) {
  const { lang } = await params;
  const queryParams = await searchParams;
  const initialData = await getInitialData(queryParams || {});

  return (
    <div className="min-h-screen bg-gray-50 px-2 md:p-4">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-md text-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {lang === "ar" ? "الترجمات المفقودة" : "Missing Translations"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {lang === "ar"
                  ? "سجل متابعة المفاتيح غير المترجمة في الواجهة والصفحات"
                  : "Track untranslated translation keys and target pages"}
              </p>
            </div>
          </div>
        </div>

        {/* Container */}
        <MissingTranslationsContainer
          initialData={initialData}
          queryParams={queryParams}
          lang={lang}
        />
      </div>
    </div>
  );
}
