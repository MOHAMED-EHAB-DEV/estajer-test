"use client";
import { NotificationsIcon } from "../ui/svgs/icons/NotificationsIconSvg";
import { useEffect, useState } from "react";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
import dynamic from "next/dynamic";

const NotificationsDrawer = dynamic(() => import("./NotificationsDrawer"), {
  ssr: false,
});
import { useUser } from "@/context/UserContext";
import { sendGTMEvent } from "@next/third-parties/google";
import Button from "../ui/Button";

export default function NotificationList({ translate, lang, home }) {
  const t = (text) => translate(`notifications.${text}`);
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();

  const fetchNotifications = async (pageNum) => {
    setIsLoading(true);
    try {
      if (!user) return;
      const response = await fetch(
        `/api/notifications?client=true&page=${pageNum}&limit=10`,
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications((prev) =>
        pageNum === 1 ? data.data : [...prev, ...data.data],
      );
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setNotifications([]);
      fetchNotifications(1);
    }
  }, [isOpen]);

  const handleShowMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };
  const [notificationsCount, setNotificationsCount] = useState(0);

  const getNotifications = async () => {
    try {
      if (!user) return;
      const res = await fetch("/api/notifications?notSeen=true&client=true");
      const data = await res.json();
      if (data.success) setNotificationsCount(data.count);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);
  return (
    <div className="relative flex">
      <Button
        isIconOnly
        color="transparent"
        size="md"
        variant="light"
        onPress={() => {
          try {
            sendGTMEvent({
              event: "drawer_open",
              drawer_name: "notifications_drawer",
              location: home ? "home_header" : "header",
            });
          } catch (_) {}
          onOpen();
        }}
        radius="full"
        title={t("title")}
        className="w-full h-full"
      >
        <NotificationsIcon
          className={
            home
              ? "md:w-9 md:h-9 w-7 h-7"
              : "md:w-[41px] md:h-[41px] w-[34px] h-[33px]"
          }
        />
      </Button>
      {notificationsCount > 0 && (
        <div className="md:w-[14px] md:h-[14px] w-2.5 h-2.5 absolute rounded-full top-0 right-0 bg-primary border"></div>
      )}
      {isOpen && (
        <NotificationsDrawer
          open={isOpen}
          setOpen={onOpenChange}
          lang={lang}
          notifications={notifications}
          isLoading={isLoading}
          translate={translate}
          showMore={handleShowMore}
          hasMore={page < totalPages}
        />
      )}
    </div>
  );
}
