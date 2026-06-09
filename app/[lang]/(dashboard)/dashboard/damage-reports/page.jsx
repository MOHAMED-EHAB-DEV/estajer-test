import React from "react";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import DamageReportsList from "@/components/dashboard/DamageReportsList";

const getDamageReports = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/damage-reports`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch damage reports");
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching damage reports:", error);
    return [];
  }
};

export default async function DamageReportsPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  const damageReports = await getDamageReports();

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {t("dashboard.damageReports.title")}
          </h1>
          <p className="text-gray-500 mt-1">
            متابعة حالة تقارير الأضرار المقدمة
          </p>
        </div>
      </div>

      <DamageReportsList
        langPrefix={langPrefix}
        reports={damageReports}
        lang={lang}
        translate={t()}
      />
    </div>
  );
}
