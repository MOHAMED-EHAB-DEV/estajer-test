import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";
import DashboardVisitsContainer from "@/components/dashboard/visits/DashboardVisitsContainer";

const getVisitsData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/visits`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch visits");
    const res = await response.json();
    return res.success ? res.data : null;
  } catch (error) {
    console.error("Error fetching visits:", error);
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return {
    title: `تحليل الزيارات - ${translate("siteName")}`,
  };
}

export default async function DashboardVisitsPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const initialData = await getVisitsData();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <DashboardVisitsContainer
        lang={lang}
        translate={translate()}
        initialData={initialData}
      />
    </div>
  );
}
