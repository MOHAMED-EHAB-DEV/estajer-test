"use client";
import { useUser } from "@/context/UserContext";
import ProfileImage from "./ProfileImage";
import AccountInfo from "./AccountInfo";
import ChangePassword from "./ChangePassword";
import BranchesManager from "./BranchesManager";
import HolidayManager from "./HolidayManager";
import { useTranslations } from "@/hooks/useTranslations";

export default function SettingsForm({ lang, translate }) {
  const { user, setUser } = useUser();
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.settings.${text}`);
  return (
    <div>
      <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-semibold md:mb-6 mb-2">
        {t("title")}
      </h1>
      <div className="flex flex-wrap justify-center md:gap-8 gap-4 max-w-screen-2xl mx-auto md:px-6 mb-6">
        <ProfileImage
          translate={translate}
          user={user}
          setUser={setUser}
          t={t}
          lang={lang}
        />
        <div className="grow">
          <AccountInfo user={user} setUser={setUser} t={t} lang={lang} />
          <ChangePassword t={t} />
          {user?.hasBranches && (
            <BranchesManager
              user={user}
              setUser={setUser}
              t={t}
              lang={lang}
              translate={translate}
            />
          )}
          <HolidayManager
            user={user}
            setUser={setUser}
            t={t}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
