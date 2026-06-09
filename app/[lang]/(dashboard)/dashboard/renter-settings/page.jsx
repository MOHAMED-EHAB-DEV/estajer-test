import React from "react";
import RenterSettingsForm from "@/components/dashboard/settings/RenterSettingsForm";
import { getTranslations } from "@/hooks/getTranslations";

export default async function RenterSettingsPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div>
      <RenterSettingsForm lang={lang} translate={translate()} />
    </div>
  );
}