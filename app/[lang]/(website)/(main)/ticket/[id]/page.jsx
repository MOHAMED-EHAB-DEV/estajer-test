import { getTranslations } from "@/hooks/getTranslations";
import VisitorTicketDetail from "@/components/support/VisitorTicketDetail";

export const metadata = {
  title: "تفاصيل التذكرة | إستأجر",
};

export default async function page({ params, searchParams }) {
  const { lang, id } = await params;
  const { vid } = await searchParams;

  const translate = await getTranslations(lang);
  const t = (key) => translate(`support.ticket.${key}`);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold font-IBMPlex">{t("title")}</h1>
      </div>
      <VisitorTicketDetail
        lang={lang} 
        translate={translate()}
        id={id}
        vid={vid}
      />
    </div>
  );
}
