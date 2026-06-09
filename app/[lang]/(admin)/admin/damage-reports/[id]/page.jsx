import { getTranslations } from "@/hooks/getTranslations";
import DamageReportDetails from "@/components/admin/DamageReportDetails";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Server-side function to get damage report data
const getDamageReportData = async (reportId) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/damage-reports/${reportId}`,
      { headers: { Authorization: token } },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching damage report:", error);
    return null;
  }
};

export default async function DamageReportDetailsPage({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";

  // Get damage report data
  const report = await getDamageReportData(id);

  if (!report) redirect(`/${langPrefix}admin/damage-reports`);

  return (
    <div className="p-4 md:p-6">
      <DamageReportDetails
        report={report}
        translate={translate()}
        lang={lang}
        langPrefix={langPrefix}
      />
    </div>
  );
}
