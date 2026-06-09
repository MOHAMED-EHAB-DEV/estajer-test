import AdminSessionsContainer from "@/components/admin/tracking/AdminSessionsContainer";
import { cookies } from "next/headers";

const getInitialData = async (searchParams) => {
  try {
    const apiParams = new URLSearchParams();

    apiParams.set("page", searchParams?.page || "1");
    apiParams.set("limit", searchParams?.limit || "15");

    if (searchParams?.journey) apiParams.set("journey", searchParams.journey);
    if (searchParams?.dateFrom) apiParams.set("dateFrom", searchParams.dateFrom);
    if (searchParams?.dateTo) apiParams.set("dateTo", searchParams.dateTo);
    if (searchParams?.search) apiParams.set("search", searchParams.search);
    if (searchParams?.size) apiParams.set("size", searchParams.size);
    if (searchParams?.device) apiParams.set("device", searchParams.device);
    if (searchParams?.browser) apiParams.set("browser", searchParams.browser);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/tracking/sessions?${apiParams}`,
      { method: "GET", headers: { Authorization: token }, cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sessions");
    }

    const data = await response.json();
    return data.success ? data : { data: [], pagination: { total: 0, pages: 1, page: 1 } };
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return { data: [], pagination: { total: 0, pages: 1, page: 1 } };
  }
};

export default async function AdminSessionsPage({ params, searchParams }) {
  const { lang } = await params;
  const queryParams = await searchParams;
  const initialData = await getInitialData(queryParams || {});

  return (
    <AdminSessionsContainer 
      lang={lang} 
      initialData={initialData} 
      queryParams={queryParams} 
    />
  );
}
