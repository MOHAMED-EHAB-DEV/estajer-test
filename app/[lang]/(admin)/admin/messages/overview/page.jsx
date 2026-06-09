import { Suspense } from "react";
import AdminMessagesOverviewContainer from "@/components/admin/AdminMessagesOverviewContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import LatestMessages from "@/components/admin/LatestMessages";
import LatestSupportTickets from "@/components/admin/LatestSupportTickets";

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        translate={translate()}
        title={translate("titles.messages")}
      />

      <AdminMessagesOverviewContainer translate={translate()} lang={lang} />

      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4">
        <Suspense
          fallback={<LatestMessages translate={translate()} placeholder />}
        >
          <LatestMessages translate={translate()} />
        </Suspense>
        <LatestSupportTickets translate={translate()} />
      </div>
    </div>
  );
};

export default page;
