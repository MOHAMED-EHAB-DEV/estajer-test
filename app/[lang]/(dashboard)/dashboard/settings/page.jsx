import React from "react";
import SettingsForm from "@/components/dashboard/settings/SettingsForm";
import { getTranslations } from "@/hooks/getTranslations";

export default async function SettingsPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div>
      <SettingsForm lang={lang} translate={translate()} />
    </div>
  );
}
