import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import UserTicketDetail from "@/components/dashboard/support/UserTicketDetail";
import Link from "next/link";

export const metadata = {
  title: "تفاصيل التذكرة | لوحة التحكم",
};

const getTicketData = async (id) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/${id}`, {
      headers: { cookie: `token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
            return null;
        }
        throw new Error("Failed to fetch ticket");
    }
    const data = await res.json();
    return data?.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return null;
  }
};

export default async function page({ params }) {
  const { lang, id } = await params;
  const ticket = await getTicketData(id);

  if (!ticket) {
    return notFound();
  }

  const translate = await getTranslations(lang);
  const t = (key) => translate(`dashboard.support.${key}`);

  return (
    <div className="mb-4">
      <Link
        href={`/${lang === "ar" ? "" : "en/"}dashboard/support`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 rtl:rotate-180">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        {t("backToTickets")}
      </Link>
      <UserTicketDetail 
        initialTicket={ticket} 
        lang={lang} 
        translate={translate()}
      />
    </div>
  );
}
