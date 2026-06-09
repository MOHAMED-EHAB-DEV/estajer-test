import Cards from "@/components/dashboard/Cards";
import Orders from "@/components/dashboard/Orders";
import NotificationsContainer from "@/components/dashboard/NotificationsContainer";
import WelcomeUser from "@/components/shared/WelcomeUser";
import WelcomeDashboardData from "@/components/dashboard/WelcomeDashboardData";
import DashboardRoleSwitchWrapper from "@/components/dashboard/DashboardRoleSwitchWrapper";
import { getTranslations } from "@/hooks/getTranslations";
import { Suspense } from "react";

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block lg:text-[1.8rem] md:text-[1.6rem] text-[1rem] font-semibold md:mb-6 mb-1.5">
          {translate("dashboard.home.title")}
        </h1>
      </div>
      <Suspense
        fallback={
          <WelcomeUser translate={translate()} langPrefix={langPrefix} />
        }
      >
        <WelcomeDashboardData translate={translate()} langPrefix={langPrefix} />
      </Suspense>
      <DashboardRoleSwitchWrapper
        initialRole="renter"
        translate={translate()}
        langPrefix={langPrefix}
        lang={lang}
      />
      <Suspense
        fallback={
          <Cards translate={translate} langPrefix={langPrefix} placeholder />
        }
      >
        <Cards key={"cards"} translate={translate} langPrefix={langPrefix} />
      </Suspense>
      <div className="gap-6 grid xl:grid-cols-3">
        <Suspense
          fallback={
            <Orders
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
            key={"orders"}
            lang={lang}
          />
        </Suspense>

        <Suspense
          fallback={
            <NotificationsContainer
              translate={translate}
              lang={lang}
              placeholder
            />
          }
        >
          <NotificationsContainer
            translate={translate}
            key={"notifications"}
            lang={lang}
          />
        </Suspense>
      </div>
    </div>
  );
}
