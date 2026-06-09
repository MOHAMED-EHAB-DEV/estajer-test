import TaskContainer from "@/components/admin/tasks/TaskContainer";
import TaskFilters from "@/components/admin/tasks/TaskFilters";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";

// Server-side data fetching function
const getInitialData = async (searchParams) => {
  try {
    const apiParams = new URLSearchParams();
    apiParams.set("page", searchParams?.page || "1");
    apiParams.set("limit", searchParams?.limit || "20");
    apiParams.set("sortBy", searchParams?.sortBy || "priority");
    apiParams.set("sortOrder", searchParams?.sortOrder || "desc");

    if (searchParams?.search) apiParams.set("search", searchParams.search);
    if (searchParams?.type) apiParams.set("type", searchParams.type);
    if (searchParams?.status) apiParams.set("status", searchParams.status);
    if (searchParams?.dateFrom)
      apiParams.set("dateFrom", searchParams.dateFrom);
    if (searchParams?.dateTo) apiParams.set("dateTo", searchParams.dateTo);
    if (searchParams?.showCompleted)
      apiParams.set("showCompleted", searchParams.showCompleted);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/tasks?${apiParams}`,
      { method: "GET", headers: { Authorization: token }, cache: "no-store" }
    );

    if (!response.ok) throw new Error("Failed to fetch tasks");

    const result = await response.json();
    if (result.success) {
      return {
        tasks: result.data || [],
        totalTasks: result.pagination?.total || 0,
        totalPages: result.pagination?.pages || 1,
        currentPage: result.pagination?.page || 1,
      };
    }
    throw new Error(result.error || "Failed to fetch tasks");
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return { tasks: [], totalTasks: 0, totalPages: 1, currentPage: 1 };
  }
};

// Task Icon SVG
const TaskIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

const AdminTasksPage = async ({ params, searchParams }) => {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const queryParams = await searchParams;
  const initialData = await getInitialData(queryParams || {});

  return (
    <div className="min-h-screen bg-gray-50 px-1 md:px-4 pt-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 bg-gradient-to-r from-white to-[#f48a42]/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-2xl flex items-center justify-center shadow-lg">
                <TaskIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("admin.tasks.title")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t("admin.tasks.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <TaskFilters queryParams={queryParams} translate={t()} />
        </div>

        {/* Tasks Container */}
        <TaskContainer initialData={initialData} translate={t()} lang={lang} />
      </div>
    </div>
  );
};

export default AdminTasksPage;
