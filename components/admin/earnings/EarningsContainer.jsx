"use client";
import { useState, Suspense } from "react";
import FilterOptions from "../orders/FilterOptions";
import { useTranslations } from "@/hooks/useTranslations";
import { Cash } from "@/components/ui/svgs/CardsSvg";
import { Currency } from "../../ui/svgs/icons/CurrencySvg";;
import Cards from "../Cards";
import EarningsCharts from "./EarningsCharts";
import AreaChart from "./NetProfitCharts";
import LatestPurchases from "./LatestPurchases";

const data = [
  {
    _id: "40928597458948",
    status: "completed",
  },
  {
    _id: "40928597458646",
    status: "pending",
  },
  {
    _id: "40928597458424",
    status: "failed",
  },
  {
    _id: "40928597458453",
    status: "completed",
  },
]

const EarningsContainer = ({ lang, langPrefix, translate }) => {
  const [date, setDate] = useState("today");
  const [search, setSearch] = useState("");
  const trans = useTranslations(translate);
  const cards = [
    {
      title: trans("admin.earnings.cards.earnings"),
      Icon: Cash,
      iconColor: "#398028",
      OtherIcon: Currency,
      value: 15200,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#398028",
    },
    {
      title: trans("admin.earnings.cards.withdrawals"),
      Icon: Cash,
      iconColor: "#398028",
      OtherIcon: Currency,
      value: 505,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#398028",
    },
    {
      title: trans("admin.earnings.cards.pendingMoney"),
      Icon: Cash,
      iconColor: "#F48A42",
      OtherIcon: Currency,
      value: 505,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#F48A42",
    },
    {
      title: trans("admin.earnings.cards.conflicts"),
      Icon: Cash,
      iconColor: "#9747FF",
      OtherIcon: Currency,
      value: 105,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#9747FF",
    },
    {
      title: trans("admin.earnings.cards.totalEarnings"),
      Icon: Cash,
      iconColor: "#4FD658",
      OtherIcon: Currency,
      value: 14700,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#9747FF",
    },
  ];
  return (
    <>
      <FilterOptions
        date={date}
        setDate={setDate}
        search={search}
        setSearch={setSearch}
        translate={translate}
        showStatus={false}
        lang={lang}
      />
      <Suspense
        fallback={
          <Cards translate={trans} langPrefix={langPrefix} placeholder />
        }
      >
        <Cards translate={trans} langPrefix={langPrefix} cards={cards} />
      </Suspense>
      <EarningsCharts />
      <AreaChart />
      <LatestPurchases
        translate={translate}
        langPrefix={langPrefix}
        lang={lang}
        data={data}
      />
    </>
  );
};

export default EarningsContainer;
