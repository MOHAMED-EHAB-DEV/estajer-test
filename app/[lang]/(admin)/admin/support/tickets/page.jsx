import AdminTicketsContainer from "@/components/admin/support/tickets/AdminTicketsContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const getTicketsData = async (searchParams) => {
  try {
    const params = await searchParams;
    const limit = params?.limit || 12;
    const pageParam = params?.page || 1;
    const status = params?.status || "all";
    const dateAdded = params?.dateAdded || "all";
    const search = params?.search || "";

    const queryString = new URLSearchParams({
      limit: limit.toString(),
      page: pageParam.toString(),
      status,
      dateAdded,
      search,
    }).toString();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets?${queryString}`, {
      headers: { cookie: `token=${token}` },
      cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to fetch tickets");
    const data = await res.json();
    return data?.success ? data.data : { tickets: [], totalPages: 1, currentPage: 1 };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return { tickets: [], totalPages: 1, currentPage: 1 };
  }
};

const page = async ({ params, searchParams }) => {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const translate = await getTranslations(lang);
  
  const data = await getTicketsData(resolvedSearchParams);
  const tickets = data.tickets;
  const totalPages = data.totalPages;
  const currentPage = data.currentPage;

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        translate={translate()}
        title={translate("titles.tickets")}
      />

      <AdminTicketsContainer 
        tickets={tickets} 
        translate={translate()} 
        lang={lang} 
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
};

export default page;
