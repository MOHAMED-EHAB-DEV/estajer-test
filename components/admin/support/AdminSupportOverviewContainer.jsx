import { Suspense } from "react";
import FilterOptions from "../orders/FilterOptions";
import { useTranslations } from "@/hooks/useTranslations";
import { Tickets } from "@/components/ui/svgs/CardsSvg";
import Cards from "../Cards";

const AdminSupportOverviewContainer = ({ translate, stats }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.support.${text}`);

  const cards = [
    {
      title: "تذاكر دعم قيد الحل",
      Icon: Tickets,
      iconColor: "#F48A42",
      value: stats?.inprogress || 0,
      review: "hidden",
      reviewColor: "#6B7280",
      valueColor: "#F48A42",
    },
    {
      title: "تذاكر دعم تم حلها",
      Icon: Tickets,
      iconColor: "#4FD658",
      value: stats?.solved || 0,
      review: "hidden",
      reviewColor: "#6B7280",
      valueColor: "#4FD658",
    },
    {
      title: t("cards.cancelledTickets"),
      Icon: Tickets,
      iconColor: "#F44242",
      value: stats?.cancelled || 0,
      review: "hidden",
      reviewColor: "#6B7280",
      valueColor: "#F44242",
    },
    {
      title: t("cards.allTickets"),
      Icon: Tickets,
      iconColor: "#9747FF",
      value: stats?.total || 0,
      review: "hidden",
      reviewColor: "#6B7280",
      valueColor: "#9747FF",
    },
  ];
  return (
    <>
      <Suspense fallback={<Cards placeholder />}>
        <Cards cards={cards} />
      </Suspense>
    </>
  );
};

export default AdminSupportOverviewContainer;
