"use client";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { format, isToday, isYesterday } from "date-fns";
import { useTranslations } from "@/hooks/useTranslations";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import { Messages } from "@/components/ui/svgs/icons/MessagesSvg";;
import { ar } from "date-fns/locale";

const Ai_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1763326241/abc0121a-15f7-40ba-adf3-07b2e2eba8d1_ev61fp.webp";
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp";

export default function AdminChatsList({
  onSelectChat,
  selectedChat,
  chats,
  translate,
  aiAssistant = false,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.messages.${text}`);

  const formatMessageDate = (date) => {
    if (isToday(new Date(date))) return format(new Date(date), "h:mm a");
    if (isYesterday(new Date(date))) return "امس";
    return format(new Date(date), "M/d", { locale: ar });
  };

  return (
    <div className="h-full">
      <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.4rem] font-semibold mt-7 px-6 border-b border-b-[#EAEEF3] pb-6">
        {aiAssistant ? "رسائل الذكاء الاصطناعي" : t("title")}
      </h1>
      <div className="overflow-y-auto h-[calc(100%-6rem)]">
        {chats.length > 0 ? (
          chats?.map((chat) => {
            const isSelected = aiAssistant
              ? selectedChat?.sessionId === chat.sessionId
              : selectedChat?.chatId === chat.chatId;
            const lastMessage = chat.messages?.[0];
            const participants = aiAssistant
              ? [
                  {
                    userId: {
                      fullName:
                        chat?.user?.fullName || chat?.visitorName || "زائر",
                      avatar: chat?.user?.avatar,
                    },
                  },
                  {
                    userId: {
                      fullName: "Estajer Assistant",
                      avatar: Ai_AVATAR,
                    },
                  },
                ]
              : chat.participants;
            return (
              <div
                key={chat.sessionId || chat.chatId}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center p-4 cursor-pointer border-b border-b-[#EAEEF3] ${
                  isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center relative">
                  <Image
                    src={anyImgUrl({
                      src: participants[0]?.userId?.avatar || DEFAULT_AVATAR,
                      size: 100,
                    })}
                    alt={participants[0]?.userId?.fullName || "User"}
                    width={45}
                    height={45}
                    className="border-4 z-10 rounded-full border-white"
                    unoptimized
                  />
                  <Image
                    src={anyImgUrl({
                      src: participants[1]?.userId?.avatar || DEFAULT_AVATAR,
                      size: 100,
                    })}
                    alt={participants[1]?.userId?.fullName || "User"}
                    width={35}
                    height={35}
                    className="rounded-full translate-x-3"
                    unoptimized
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold text-sm flex flex-col">
                      <span>{`${participants[0]?.userId?.fullName}`}</span>
                      <span>{`و ${participants[1]?.userId?.fullName}`}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {lastMessage && formatMessageDate(lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {lastMessage?.content.substring(0, 40)}...
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
