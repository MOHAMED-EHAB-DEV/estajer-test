import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";
import UserTicketsContainer from "@/components/dashboard/support/UserTicketsContainer";

export const metadata = {
  title: "تذاكر الدعم | لوحة التحكم",
};

const getTicketsData = async (searchParams) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    const params = new URLSearchParams(searchParams);
    if (!params.has("limit")) params.set("limit", "9");

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets?${params.toString()}`, {
      headers: { cookie: `token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch tickets");
    const data = await res.json();
    return data?.success ? data.data : { tickets: [], totalPages: 1, currentPage: 1 };
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return { tickets: [], totalPages: 1, currentPage: 1 };
  }
};

export default async function page({ params, searchParams }) {
  const { lang } = await params;
  const sParams = await searchParams;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const t = (key) => translate(`dashboard.support.${key}`);
  
  const ticketData = await getTicketsData(sParams);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.4rem] font-semibold text-gray-800">
          {t("myTickets")}
        </h1>
      </div>
      
      <UserTicketsContainer 
        initialTickets={ticketData.tickets}
        initialTotalPages={ticketData.totalPages}
        initialCurrentPage={ticketData.currentPage}
        lang={lang} 
        translate={translate()}
        langPrefix={langPrefix}
      />
    </div>
  );
}
