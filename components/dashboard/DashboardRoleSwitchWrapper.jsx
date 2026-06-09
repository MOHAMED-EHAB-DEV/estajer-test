"use client";

import { useUser } from "@/context/UserContext";
import DashboardRoleSwitch from "./DashboardRoleSwitch";

export default function DashboardRoleSwitchWrapper({
  translate,
  langPrefix,
  initialRole,
  lang,
}) {
  const { user } = useUser();

  return (
    <DashboardRoleSwitch
      translate={translate}
      langPrefix={langPrefix}
      initialRole={initialRole}
      updateValue={!user?.isRenter}
      lang={lang}
    />
  );
}
