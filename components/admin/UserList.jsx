"use client";
import { Users } from "../ui/svgs/icons/UsersSvg";
import Button from "../ui/Button";
// import { useEffect, useState } from "react";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
// import NotificationsDrawer from "./NotificationsDrawer";

// import { useUser } from "@/context/UserContext";

export default function UserList({ translate, lang, home }) {
  const t = (text) => translate(`admin.home.users.${text}`);
  // const { user } = useUser();
  // const [notifications, setNotifications] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [page, setPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();

  // const fetchUsers = async (pageNum) => {
  //     setIsLoading(true);
  //     try {
  //         if (!user) return;
  //         const response = await fetch(
  //             `/api/notifications?client=true&page=${pageNum}&limit=10`
  //         );
  //         if (!response.ok) throw new Error("Failed to fetch notifications");
  //         const data = await response.json();
  //         setNotifications((prev) =>
  //             pageNum === 1 ? data.data : [...prev, ...data.data]
  //         );
  //         setTotalPages(data.totalPages);
  //     } catch (error) {
  //         console.error("Error fetching notifications:", error);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };
  //
  // useEffect(() => {
  //     if (isOpen) {
  //         setPage(1);
  //         setUsers([]);
  //         fetchUsers(1);
  //     }
  // }, [isOpen]);
  //
  // const handleShowMore = () => {
  //     if (page < totalPages) {
  //         const nextPage = page + 1;
  //         setPage(nextPage);
  //         fetchUsers(nextPage);
  //     }
  // };
  // const [usersCount, setUsersCount] = useState(0);
  //
  // const getUsers = async () => {
  //     try {
  //         if (!user) return;
  //         const res = await fetch("/api/notifications?notSeen=true&client=true");
  //         const data = await res.json();
  //         if (data.success) setNotificationsCount(data.count);
  //     } catch (error) {
  //         console.error("Failed to fetch favorites:", error);
  //     }
  // };

  // useEffect(() => {
  //     //     getNotifications();
  //     // }, []);
  return (
    <div className="relative flex">
      <Button
        isIconOnly
        color="transparent"
        variant="light"
        onPress={onOpen}
        radius="full"
        title={t("users")}
        className="w-10 h-10 hover:!bg-[#FCE7C5] bg-[#FCE7C5] flex items-center justify-center"
      >
        <Users />
      </Button>
      {/*{usersCount > 0 && (*/}
      {/*    <div className="w-[14px] h-[14px] absolute rounded-full top-0 right-0 bg-primary border"></div>*/}
      {/*)}*/}
    </div>
  );
}
