import SponsorFilters from "@/components/admin/SponsorFilters";
import SponsorContainer from "@/components/admin/SponsorContainer";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import categories from "@/static/categories";
import { Sponsors } from "@/components/ui/svgs/Admin";

// Server-side data fetching function
const getInitialData = async (searchParams, lang) => {
  try {
    const apiParams = new URLSearchParams();

    // Add basic parameters
    apiParams.set("page", searchParams?.page || "1");
    apiParams.set("limit", searchParams?.limit || "20");
    apiParams.set("sortBy", searchParams?.sortBy || "createdAt");
    apiParams.set("sortOrder", searchParams?.sortOrder || "desc");
    apiParams.set("lang", lang || "ar");

    // Add search parameter
    if (searchParams?.search) {
      apiParams.set("search", searchParams?.search);
    }

    // Add category filter
    if (searchParams?.category) {
      apiParams.set("category", searchParams?.category);
    }

    // Add status filter
    if (searchParams?.isActive) {
      apiParams.set("isActive", searchParams?.isActive);
    }

    // Add language parameter
    apiParams.set("lang", lang);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/sponsors?${apiParams}`,
      { method: "GET", headers: { Authorization: token } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sponsors");
    }

    const result = await response.json();

    if (result.success) {
      return {
        sponsors: result.data || [],
        totalSponsors: result.pagination?.total || 0,
        totalPages: result.pagination?.pages || 1,
        currentPage: result.pagination?.page || 1,
      };
    } else {
      throw new Error(result.error || "Failed to fetch sponsors");
    }
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return {
      sponsors: [],
      totalSponsors: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
};

const AdminSponsors = async ({ params, searchParams }) => {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const categoryData = (await categories({ lang })).map(({ name, key }) => ({
    name,
    key,
  }));

  const queryParams = await searchParams;
  const initialData = await getInitialData(queryParams || {}, lang);

  return (
    <div className="min-h-screen bg-gray-50 px-1 md:px-4 pt-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Sponsors className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("admin.sponsors.title")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t("admin.sponsors.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <SponsorFilters
            queryParams={queryParams}
            translate={t()}
            categories={categoryData}
          />
        </div>

        {/* Sponsors Container */}
        <SponsorContainer
          initialData={initialData}
          translate={t()}
          categories={categoryData}
          lang={lang}
        />
      </div>
    </div>
  );
};

export default AdminSponsors;
