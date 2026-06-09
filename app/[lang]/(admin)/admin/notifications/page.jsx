import { Suspense } from "react";
import LatestActivities from "@/components/admin/LatestActivities";
import AdminNotificationsContainer from "@/components/admin/AdminNotificationsContainer";
import AdminOverviewNotificationsContainer from "@/components/admin/AdminOverviewNotificationsContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        title={translate("titles.notifications")}
        translate={translate()}
      />

      <AdminOverviewNotificationsContainer translate={translate()} lang={lang} />

      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4">
        <Suspense
          fallback={<LatestActivities translate={translate()} title={translate("admin.home.latestActivities.title")} placeholder />}
        >
          <AdminNotificationsContainer translate={translate()} title={translate("admin.home.latestActivities.title")} />
        </Suspense>
        <Suspense
          fallback={<LatestActivities translate={translate()} title={translate("admin.home.latestActivities.dashboardTitle")} placeholder />}
        >
          <AdminNotificationsContainer translate={translate()} title={translate("admin.home.latestActivities.dashboardTitle")} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
