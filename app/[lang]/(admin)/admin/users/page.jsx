import UserContainer from "@/components/admin/UserContainer";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";

// Server-side data fetching function
const getInitialData = async (searchParams) => {
  try {
    const apiParams = new URLSearchParams();

    apiParams.set("page", searchParams?.page || "1");
    apiParams.set("limit", searchParams?.limit || "20");
    apiParams.set("sortBy", searchParams?.sortBy || "createdAt");
    apiParams.set("sortOrder", searchParams?.sortOrder || "desc");

    if (searchParams?.search) {
      apiParams.set("search", searchParams?.search);
    }
    if (searchParams?.accountType) {
      apiParams.set("accountType", searchParams?.accountType);
    }
    if (searchParams?.startDate) {
      apiParams.set("startDate", searchParams.startDate);
    }
    if (searchParams?.endDate) {
      apiParams.set("endDate", searchParams.endDate);
    }
    if (searchParams?.isRenter) {
      apiParams.set("isRenter", searchParams.isRenter);
    }
    if (searchParams?.hasApprovedProduct) {
      apiParams.set("hasApprovedProduct", searchParams.hasApprovedProduct);
    }

    if (searchParams?.status) {
      switch (searchParams?.status) {
        case "verified":
          apiParams.set("isVerified", "true");
          break;
        case "pending":
          apiParams.set("isVerified", "false");
          break;
        case "banned":
          apiParams.set("isBanned", "true");
          break;
        case "review_requested":
          apiParams.set("reviewRequested", "true");
          break;
      }
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/users?${apiParams}`,
      { method: "GET", headers: { Authorization: token } },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const result = await response.json();

    if (result.success) {
      return {
        users: result.data || [],
        totalUsers: result.pagination?.totalUsers || 0,
        totalPages: result.pagination?.totalPages || 1,
        currentPage: result.pagination?.currentPage || 1,
      };
    } else {
      throw new Error(result.error || "Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return {
      users: [],
      totalUsers: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
};

export default async function AdminUsers({ params, searchParams }) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";

  const queryParams = await searchParams;
  const initialData = await getInitialData(queryParams || {});

  return (
    <div className="flex flex-col gap-3 md:gap-5 md:px-4">
      {/* Page Header */}
      <div className="flex items-center gap-4 mt-2 md:mt-6 mb-1 md:mb-2">
        <div>
          <h1 className="text-base md:text-xl lg:text-2xl font-bold text-darkNavy">
            {t("admin.users.title")}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5 font-NotoSansArabic">
            {t("admin.users.description")}
          </p>
        </div>
      </div>

      <UserContainer
        initialData={initialData}
        translate={t()}
        langPrefix={langPrefix}
        lang={lang}
        queryParams={queryParams}
      />
    </div>
  );
}
