import { Suspense } from "react";
import AdminSupportOverviewContainer from "@/components/admin/support/AdminSupportOverviewContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import AdminNotificationsContainer from "@/components/admin/AdminNotificationsContainer";
import SupportCharts from "@/components/admin/support/SupportCharts";
import LatestSupportTickets from "@/components/admin/LatestSupportTickets";
import { cookies } from "next/headers";

const getTicketsStats = async () => {
  const defaultStats = {
    new: 0,
    inprogress: 0,
    cancelled: 0,
    solved: 0,
    total: 0,
    userCount: 0,
    guestCount: 0,
  };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/stats`, {
        headers: { Authorization: token },
        cache: "no-store"
    });
    
    if (!res.ok) throw new Error("Failed to fetch stats");
    const data = await res.json();
    if(data.success) {
        return data.data;
    }
    return defaultStats;
  } catch(e) {
    console.error("Error fetching ticket stats:", e);
    return defaultStats;
  }
};

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  
  const stats = await getTicketsStats();

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        title={translate("titles.support")}
        translate={translate()}
      />

      <AdminSupportOverviewContainer translate={translate()} stats={stats} />

      <div className="grid gap-4 grid-rows-2 grid-cols-1 md:grid-rows-1 md:grid-cols-2">
        <SupportCharts stats={stats} />
        <Suspense fallback={<AdminNotificationsContainer placeholder />}>
          <AdminNotificationsContainer
            translate={translate()}
            title={translate("admin.home.latestActivities.dashboardTitle")}
          />
        </Suspense>
      </div>

      <LatestSupportTickets translate={translate()} lang={lang} />
    </div>
  );
};

export default page;
