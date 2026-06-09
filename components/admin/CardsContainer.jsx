import Cards from "./Cards";
import {
  box3DQuestionMarkFill,
  Eye,
  Messages2,
  Product,
  User,
} from "@/components/ui/svgs/CardsSvg";
import { cookies } from "next/headers";

async function getAdminStatistics(startDate, endDate) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL
      }/api/admin/statistics?${params.toString()}`,
      { headers: { Authorization: token }, cache: "no-store" }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch admin statistics: ${res.status}`);
    }
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return null;
  }
}

export default async function CardsContainer({
  translate,
  queryParams,
  placeholder,
}) {
  const t = (text) => translate(`admin.home.cards.${text}`);
  const startDate = queryParams?.startDate;
  const endDate = queryParams?.endDate;
  const fallbackStats = {
    newPendingProducts: 0,
    activeProducts: 0,
    websiteViews: 0,
    unreadMessages: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    confirmedRequests: 0,
    cancelledRequests: 0,
  };

  const stats = placeholder
    ? fallbackStats
    : await getAdminStatistics(startDate, endDate);

  // Fallback data if API fails

  const data = stats || fallbackStats;

  const cards = [
    {
      title: t("newPendingProducts"),
      Icon: Product,
      iconColor: "#F48A42",
      value: data.newPendingProducts,
      review:
        data.newPendingProducts > 0
          ? `منتجات جديدة في انتظار الموافقة`
          : "لا توجد منتجات جديدة",
      reviewColor: data.newPendingProducts > 0 ? "#F48A42" : "#6B7280",
      valueColor: "#0D092B",
    },
    {
      title: t("activeProducts"),
      Icon: Product,
      iconColor: "#17A1FA",
      value: data.activeProducts,
      review: `منتجات نشطة ومعتمدة`,
      reviewColor: "#17A1FA",
      valueColor: "#17A1FA",
    },
    {
      title: t("websiteViews"),
      Icon: Eye,
      iconColor: "#FF077F",
      value: data.websiteViews,
      review: `إجمالي المشاهدات`,
      reviewColor: "#FF077F",
      valueColor: "#FF077F",
    },
    {
      title: t("websiteMessages"),
      Icon: Messages2,
      iconColor: "#A2551E",
      value: data.unreadMessages,
      review:
        data.unreadMessages > 0 ? "رسائل غير مقروءة" : "لا توجد رسائل جديدة",
      reviewColor: "#A2551E",
      valueColor: "#A2551E",
    },
    {
      title: t("AllUsers"),
      Icon: User,
      iconColor: "#173DFA",
      value: data.totalUsers,
      review:
        data.activeUsers > 0
          ? `النشطين: ${data.activeUsers}`
          : `إجمالي المستخدمين`,
      reviewColor: "#173DFA",
      valueColor: "#173DFA",
    },
    {
      title: t("pendingPaidRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#9747FF",
      value: data.pendingRequests,
      review:
        data.pendingRequests > 0
          ? `طلبات في انتظار الموافقة`
          : "لا توجد طلبات معلقة",
      reviewColor: data.pendingRequests > 0 ? "#9747FF" : "#6B7280",
      valueColor: "#9747FF",
    },
    {
      title: t("confirmedRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#4FD6B6",
      value: data.confirmedRequests,
      review:
        data.confirmedRequests > 0 ? `طلبات مؤكدة` : "لا توجد طلبات مؤكدة",
      reviewColor: data.confirmedRequests > 0 ? "#4FD6B6" : "#6B7280",
      valueColor: "#4FD6B6",
    },
    {
      title: t("cancelledRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F55757",
      value: data.cancelledRequests,
      review:
        data.cancelledRequests > 0 ? `طلبات ملغية` : "لا توجد طلبات ملغية",
      reviewColor: data.cancelledRequests > 0 ? "#F55757" : "#6B7280",
      valueColor: "#F55757",
    },
  ];

  return (
    <Cards
      cards={cards}
      dateRange={{ startDate, endDate }}
      placeholder={placeholder}
    />
  );
}
