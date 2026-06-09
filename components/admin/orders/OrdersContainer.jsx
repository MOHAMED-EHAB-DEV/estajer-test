"use client";

import { useState, Suspense } from "react";
import FilterOptions from "@/components/admin/orders/FilterOptions";
import Cards from "@/components/admin/Cards";
import { box3DQuestionMarkFill } from "@/components/ui/svgs/CardsSvg";
import { useTranslations } from "@/hooks/useTranslations";
import NewestOrders from "@/components/admin/NewestOrders";
import dynamic from "next/dynamic";

const OrdersCharts = dynamic(() => import("./OrdersCharts"), {
  ssr: false,
});

const OrdersContainer = ({ translate, langPrefix, lang, orders }) => {
  const trans = useTranslations(translate);
  const [ranking, setRanking] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("today");
  const [search, setSearch] = useState("");

  const cards = [
    {
      title: trans("admin.home.cards.newPendingRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F48A42",
      value: 0,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#9747FF",
    },
    {
      title: trans("admin.home.cards.pendingPaidRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#9747FF",
      value: 0,
      review: "-50% أقل من أمس",
      reviewColor: "#F55757",
      valueColor: "#9747FF",
    },
    {
      title: trans("admin.home.cards.acceptedRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#4FD658",
      value: 12,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#4FD658",
    },
    {
      title: trans("admin.home.cards.cancelledRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F55757",
      value: 12,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.allRequests"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#173DFA",
      value: 12,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#173DFA",
    },
  ];

  return (
    <>
      <FilterOptions
        translate={translate}
        search={search}
        setSearch={setSearch}
        status={status}
        setDate={setDate}
        date={date}
        setStatus={setStatus}
        ranking={ranking}
        setRanking={setRanking}
        lang={lang}
      />
      <Suspense
        fallback={
          <Cards translate={trans} langPrefix={langPrefix} placeholder />
        }
      >
        <Cards
          translate={trans}
          langPrefix={langPrefix}
          cards={cards}
          filterValue={date}
        />
      </Suspense>
      <OrdersCharts />
      <Suspense
        fallback={
          <NewestOrders
            translate={translate}
            langPrefix={langPrefix}
            placeholder
            lang={lang}
          />
        }
      >
        <NewestOrders
          translate={translate}
          langPrefix={langPrefix}
          key={"orders"}
          lang={lang}
          orders={orders}
        />
      </Suspense>
    </>
  );
};
export default OrdersContainer;
