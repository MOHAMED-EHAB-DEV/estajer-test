"use client";
import { useState } from "react";
import FilterOptions from "./orders/FilterOptions";
import { Notification } from "@/components/ui/svgs/icons/NotificationSvg";
import { Add } from "@/components/ui/svgs/icons/AddSvg";;
import { useTranslations } from "@/hooks/useTranslations";
import Button from "@/components/ui/Button";
import AddModal from "./AddModal";

const AdminOverviewNotificationsContainer = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.notifications.${text}`);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("today");
  const [showAddNotificationModal, setShowAddNotificationModal] =
    useState(false);
  const [data, setData] = useState({
    titleAr: "",
    titleEn: "",
    usersType: "all",
    notificationLink: "",
  });

  const onAddNotification = () => {};

  return (
    <>
      <FilterOptions
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        isShowPrintButton={false}
        showStatus={false}
        showAddNotificationsButton={true}
        translate={translate}
        lang={lang}
        showModal={showAddNotificationModal}
        setShowModal={setShowAddNotificationModal}
        modalTranslate={(text) => t(`modal.${text}`)}
        modalData={data}
        setModalData={setData}
        ModalIcon={Notification}
        onModalSubmit={onAddNotification}
        modalKey="notifications"
        isModal={true}
      >
        <Button
          onClick={() => setShowAddNotificationModal(true)}
          className="py-4 px-12 text-[#F9FAFC] font-IBMPlex bg-darkNavy font-semibold text-lg flex items-center justify-center gap-2"
        >
          <Add color="#F48A42" />
          {t("addNewNotification")}
        </Button>
        <AddModal
          isOpen={showAddNotificationModal}
          onClose={() => setShowAddNotificationModal(false)}
          t={(text) => t(`modal.${text}`)}
          data={data}
          setData={setData}
          ModalIcon={Notification}
          modalKey="notifications"
          translate={translate}
          onSubmit={onAddNotification}
        />
      </FilterOptions>
    </>
  );
};

export default AdminOverviewNotificationsContainer;
