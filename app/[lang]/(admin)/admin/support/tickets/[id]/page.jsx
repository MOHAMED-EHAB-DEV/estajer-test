import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import AdminTicketDetail from "@/components/admin/support/tickets/AdminTicketDetail";

export const metadata = {
  title: "تفاصيل التذكرة | إستأجر",
};

const getTicketData = async (id) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/${id}`, {
      headers: { cookie: `token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch ticket");
    const data = await res.json();
    return data?.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return null;
  }
};

const page = async ({ params }) => {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);

  const ticket = await getTicketData(id);

  if (!ticket) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        translate={translate()}
        title={translate("titles.tickets")}
      />
      <AdminTicketDetail 
        initialTicket={ticket} 
        lang={lang} 
        translate={translate()} 
      />
    </div>
  );
};

export default page;