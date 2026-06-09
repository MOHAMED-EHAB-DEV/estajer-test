"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { format, isToday, isYesterday } from "date-fns";
import { useUser } from "@/context/UserContext";
import { isArabic, removeLastWord } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import { Messages } from "@/components/ui/svgs/icons/MessagesSvg";;

export default function ChatsList({
  currentUserId,
  onSelectChat,
  selectedChat,
  chats,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.messages.${text}`);
  const { socket } = useUser();
  const [otherUsers, setOtherUsers] = useState([]);
  useEffect(() => {
    if (!socket) return;
    const otherUsersId = chats?.map(
      (c) =>
        c.participants.find((p) => p.userId?._id !== currentUserId)?.userId
          ?._id,
    );

    socket.on("user-status-changed", ({ userId, online }) => {
      setOtherUsers((prevUsers) => ({
        ...prevUsers,
        ...(otherUsersId.includes(userId) ? { [userId]: online } : {}),
      }));
    });
    return () => {
      socket.off("user-status-changed");
    };
  }, [socket, currentUserId]);

  const formatMessageDate = (date) => {
    if (isToday(new Date(date))) return format(new Date(date), "h:mm a");
    if (isYesterday(new Date(date))) return "امس";
    return format(new Date(date), "MM dd");
  };
  return (
    <div className="h-full">
      <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-semibold my-4 px-6 border-b border-b-[#EAEEF3] pb-4">
        {t("title")}
      </h1>
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {chats.length > 0 ? (
          chats?.map((chat) => {
            const otherParticipant = chat.participants.find(
              (p) => p.userId?._id !== currentUserId,
            );
            const isSelected = selectedChat?.chatId === chat.chatId;
            const lastMessage = chat.messages[0];

            return (
              <div
                key={chat.chatId}
                onClick={() => onSelectChat(chat)}
                className={`flex gap-2 items-center p-4 cursor-pointer ${
                  isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <Image
                    src={anyImgUrl({
                      src:
                        otherParticipant?.userId?.avatar ||
                        "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
                      size: 100,
                    })}
                    alt="avatar"
                    className="rounded-full"
                    unoptimized
                    width={50}
                    height={50}
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                      otherUsers[otherParticipant?.userId?._id] === undefined
                        ? otherParticipant?.userId?.isOnline
                          ? "bg-green-500"
                          : "bg-gray-400"
                        : otherUsers[otherParticipant?.userId?._id] === false
                          ? "bg-gray-400"
                          : "bg-green-500"
                    }`}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <div
                      dir={
                        isArabic(otherParticipant?.userId?.fullName)
                          ? "rtl"
                          : "ltr"
                      }
                      className="font-semibold"
                    >
                      {removeLastWord(otherParticipant?.userId?.fullName)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {lastMessage && formatMessageDate(lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {lastMessage.isAdmin
                      ? "استأجر : "
                      : lastMessage?.sender === currentUserId
                        ? "أنت : "
                        : ""}
                    {lastMessage?.content.substring(0, 30)}...
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyPlaceholder
            Icon={Messages}
            title={t("noMessages")}
            description={t("noMessagesDescription")}
          />
        )}
      </div>
    </div>
  );
}
