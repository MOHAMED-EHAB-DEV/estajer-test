import { cookies } from "next/headers";
import AnalyticsDashboard from "./AnalyticsDashboard";

async function getAnalyticsData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const params = new URLSearchParams();
    params.set("month", month.toString());
    params.set("year", year.toString());

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL
      }/api/admin/analytics?${params.toString()}`,
      { headers: { Authorization: token } },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch analytics data: ${res.status}`);
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return null;
  }
}

export default async function AnalyticsDashboardContainer() {
  // Get current month and year

  const analyticsData = await getAnalyticsData();

  // Fallback data if API fails
  const fallbackData = {
    chartData: [],
    pieData: [
      { name: "المستخدمين", value: 319000 },
      { name: "شركات", value: 105000 },
      { name: "تم حظرهم", value: 1245 },
    ],
    totals: {
      income: 0,
      withdrawals: 0,
      netProfit: 0,
    },
  };

  const data = analyticsData || fallbackData;

  return <AnalyticsDashboard {...data} />;
}
