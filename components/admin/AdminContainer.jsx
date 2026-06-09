import { Suspense } from "react";
import CardsContainer from "./CardsContainer";
import NewestOrders from "./NewestOrders";
import LatestActivities from "@/components/admin/LatestActivities";
import AdminNotificationsContainer from "@/components/admin/AdminNotificationsContainer";
import LatestMessages from "@/components/admin/LatestMessages";
import LatestSupportTickets from "@/components/admin/LatestSupportTickets";
import WelcomeUser from "../shared/WelcomeUser";
import WelcomeUserData from "./WelcomeUserData";
import AnalyticsDashboardContainer from "./AnalyticsDashboardContainer";

const AdminContainer = ({
  translate,
  langPrefix,
  lang,
  queryParams,
  orders,
}) => {
  return (
    <>
      <Suspense
        fallback={
          <WelcomeUser
            isAdminPage={true}
            translate={translate()}
            langPrefix={langPrefix}
            OrderCount={0}
            newChatsCount={0}
            viewsCount={0}
            queryParams={queryParams}
          />
        }
      >
        <WelcomeUserData
          translate={translate()}
          langPrefix={langPrefix}
          queryParams={queryParams}
        />
      </Suspense>
      <Suspense
        fallback={
          <CardsContainer
            translate={translate}
            langPrefix={langPrefix}
            queryParams={queryParams}
            placeholder
          />
        }
      >
        <CardsContainer
          translate={translate}
          langPrefix={langPrefix}
          queryParams={queryParams}
        />
      </Suspense>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-[25%_1fr] md:gap-5 gap-3 bg-gray-100">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        }
      >
        <AnalyticsDashboardContainer />
      </Suspense>
      <Suspense
        fallback={
          <NewestOrders
            translate={translate()}
            langPrefix={langPrefix}
            placeholder
            lang={lang}
          />
        }
      >
        <NewestOrders
          translate={translate()}
          langPrefix={langPrefix}
          key={"orders"}
          lang={lang}
          orders={orders}
          Prefix="admin/orders/"
        />
      </Suspense>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 mt-4 md:mt-6 gap-2 md:gap-3 lg:gap-4">
        <Suspense
          fallback={
            <LatestActivities
              translate={translate()}
              title={translate("admin.home.latestActivities.title")}
              placeholder
            />
          }
        >
          <AdminNotificationsContainer
            translate={translate()}
            title={translate("admin.home.latestActivities.title")}
          />
        </Suspense>
        <Suspense
          fallback={<LatestMessages translate={translate()} placeholder />}
        >
          <LatestMessages translate={translate()} />
        </Suspense>
        {/* <LatestSupportTickets translate={translate()} /> */}
      </div>
    </>
  );
};
export default AdminContainer;
