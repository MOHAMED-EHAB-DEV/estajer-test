"use client";
import {Suspense, useState} from 'react';
import FilterOptions from './orders/FilterOptions';
import { useTranslations } from "@/hooks/useTranslations";
import { Messages2, Cash, Headset } from '../ui/svgs/CardsSvg';
import Cards from './Cards';

const AdminMessagesOverviewContainer = ({ translate, lang }) => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("today");
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.messages.${text}`);

  const cards = [
    {
      title: t("cards.unreadMessages"),
      Icon: Messages2,
      iconColor: "#F48A42",
      value: 15200,
      review: "",
      reviewColor: "#6B7280",
      valueColor: "#F48A42",
    },
    {
      title: t("cards.deletedMessages"),
      Icon: Messages2,
      iconColor: "#F44242",
      value: 505,
      review: "+50% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#F44242",
    },
    {
      title: t("cards.reportedMessages"),
      Icon: Messages2,
      iconColor: "#9747FF",
      value: 505,
      review: "+50% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#9747FF",
    },
    {
      title: t("cards.allMessages"),
      Icon: Cash,
      iconColor: "#9747FF",
      value: 105,
      review: "",
      reviewColor: "#4FD658",
      valueColor: "#9747FF",
    },
    {
      title: t("cards.openedSupportTickets"),
      Icon: Headset,
      iconColor: "#F48A42",
      value: 15200,
      review: "",
      reviewColor: "#4FD658",
      valueColor: "#F48A42",
    },
    {
      title: t("cards.closedSupportTickets"),
      Icon: Headset,
      iconColor: "#4FD658",
      value: 15200,
      review: "+50% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#4FD658",
    },
    {
      title: t("cards.cancelledSupportTickets"),
      Icon: Headset,
      iconColor: "#F55757",
      value: 15200,
      review: "+50% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#F55757",
    },
    {
      title: t("cards.allSupportTickets"),
      Icon: Headset,
      iconColor: "#173DFA",
      value: 15200,
      review: "+50% زيادة عن أمس",
      reviewColor: "#173DFA",
      valueColor: "#173DFA",
    },
  ];
  return (
    <>
      <FilterOptions
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        showStatus={false}
        showAddNotificationsButton={false}
        translate={translate}
        lang={lang}
      />

      <Suspense fallback={<Cards placeholder />}>
        <Cards
            cards={cards}
        />
      </Suspense>
    </>
  );
}

export default AdminMessagesOverviewContainer;