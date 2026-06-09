import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import ErrorLogsContainer from "@/components/admin/error-logs/ErrorLogsContainer";

export const dynamic = "force-dynamic";

const getInitialData = async (searchParams) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiParams = new URLSearchParams();
    apiParams.set("viewMode", searchParams?.viewMode || "grouped");

    if (searchParams?.endpoint)
      apiParams.set("endpoint", searchParams.endpoint);
    if (searchParams?.method) apiParams.set("method", searchParams.method);
    if (searchParams?.statusCode)
      apiParams.set("statusCode", searchParams.statusCode);
    if (searchParams?.resolved)
      apiParams.set("resolved", searchParams.resolved);
    if (searchParams?.search) apiParams.set("search", searchParams.search);
    if (searchParams?.startDate)
      apiParams.set("startDate", searchParams.startDate);
    if (searchParams?.endDate) apiParams.set("endDate", searchParams.endDate);
    if (searchParams?.page) apiParams.set("page", searchParams.page);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/error-logs?${apiParams}`,
      {
        method: "GET",
        headers: { Authorization: token },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch error logs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return {
      success: false,
      data: [],
      stats: {
        totalErrors: 0,
        uniqueEndpoints: 0,
        uniqueMessages: 0,
        resolvedCount: 0,
        unresolvedCount: 0,
      },
      statusDistribution: [],
    };
  }
};

const AdminErrorLogs = async ({ params, searchParams }) => {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const queryParams = await searchParams;
  const initialData = await getInitialData(queryParams || {});

  return (
    <div className="min-h-screen bg-gray-50 px-1 md:px-4 pt-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {lang === "ar" ? "سجل الأخطاء" : "Error Logs"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {lang === "ar"
                    ? "مراقبة وتصحيح أخطاء النظام"
                    : "Monitor and debug system errors"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {initialData.stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-3xl font-bold text-gray-900">
                {initialData.stats.totalErrors?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">
                {lang === "ar" ? "إجمالي الأخطاء" : "Total Errors"}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">
                {initialData.stats.uniqueEndpoints || 0}
              </div>
              <div className="text-sm text-gray-500">
                {lang === "ar" ? "نقاط النهاية" : "Endpoints"}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-3xl font-bold text-purple-600">
                {initialData.stats.uniqueMessages || 0}
              </div>
              <div className="text-sm text-gray-500">
                {lang === "ar" ? "أخطاء فريدة" : "Unique Errors"}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-3xl font-bold text-green-600">
                {initialData.stats.resolvedCount || 0}
              </div>
              <div className="text-sm text-gray-500">
                {lang === "ar" ? "تم الحل" : "Resolved"}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="text-3xl font-bold text-red-600">
                {initialData.stats.unresolvedCount || 0}
              </div>
              <div className="text-sm text-gray-500">
                {lang === "ar" ? "غير محلول" : "Unresolved"}
              </div>
            </div>
          </div>
        )}

        {/* Main Container */}
        <ErrorLogsContainer
          initialData={initialData}
          queryParams={queryParams}
          lang={lang}
          translate={t()}
        />
      </div>
    </div>
  );
};

export default AdminErrorLogs;
