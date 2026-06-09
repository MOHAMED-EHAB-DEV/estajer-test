import Orders from "@/components/dashboard/Orders";
import NotificationsContainer from "@/components/dashboard/NotificationsContainer";
import WelcomeUser from "@/components/shared/WelcomeUser";
import RenterCards from "@/components/dashboard/RenterCards";
import DashboardRoleSwitchWrapper from "@/components/dashboard/DashboardRoleSwitchWrapper";
import { getTranslations } from "@/hooks/getTranslations";
import { Suspense } from "react";

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const t2 = (key) => translate(`dashboard.home.${key}`);
  const langPrefix = lang === "ar" ? "" : "en/";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block lg:text-[1.8rem] md:text-[1.6rem] text-[1rem] font-semibold md:mb-6 mb-1.5">
          {t2("title")}
        </h1>
      </div>
      <WelcomeUser langPrefix={langPrefix} translate={translate()} />
      <DashboardRoleSwitchWrapper
        initialRole="landlord"
        translate={translate()}
        langPrefix={langPrefix}
        lang={lang}
      />
      {/* Replaced inline cards with RenterCards component */}
      <Suspense
        fallback={
          <RenterCards
            key={"loading-renter-cards"}
            translate={translate}
            placeholder
            lang={lang}
          />
        }
      >
        <RenterCards key={"renter-cards"} translate={translate} lang={lang} />
      </Suspense>
      <div className="gap-6 grid xl:grid-cols-3">
        <Suspense
          fallback={
            <Orders
              key={"loadingRequests"}
              translate={translate}
              langPrefix={langPrefix}
              placeholder
              lang={lang}
            />
          }
        >
          <Orders
            translate={translate}
            langPrefix={langPrefix}
            key={"requests"}
            lang={lang}
            requests={true}
          />
        </Suspense>

        <Suspense
          fallback={
            <NotificationsContainer
              key={"loadingRenter"}
              translate={translate}
              placeholder
              lang={lang}
            />
          }
        >
          <NotificationsContainer
            translate={translate}
            key={"renter"}
            lang={lang}
          />
        </Suspense>
      </div>
    </div>
  );
}
