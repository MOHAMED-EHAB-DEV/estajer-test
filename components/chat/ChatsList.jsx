"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { format, isToday, isYesterday } from "date-fns";
import { useUser } from "@/context/UserContext";
import { isArabic, removeLastWord } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import { Messages } from "@/components/ui/svgs/icons/MessagesSvg";
import { Input } from "@/components/ui/Input";

export default function ChatsList({
  currentUserId,
  onSelectChat,
  selectedChat,
  chats = [],
  translate,
  supportChat,
  lang,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.messages.${text}`);
  const { socket } = useUser();
  const [otherUsers, setOtherUsers] = useState({});

  const [displayedChats, setDisplayedChats] = useState(chats);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState((chats?.length || 0) >= 20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const scrollContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setDisplayedChats(Array.isArray(chats) ? chats : []);
    setPage(1);
    setHasMore((chats?.length || 0) >= 20);
  }, [chats]);

  const fetchChatsFromApi = useCallback(async (query, pageNum = 1) => {
    if (pageNum === 1) {
      setIsSearching(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = `/api/chat/list?page=${pageNum}&limit=20&client=true${
        query ? `&search=${encodeURIComponent(query)}` : ""
      }`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const newChats = await res.json();

      if (pageNum === 1) {
        setDisplayedChats(newChats);
        setPage(1);
        setHasMore(newChats.length >= 20);
      } else {
        setDisplayedChats((prev) => {
          const existingIds = new Set(
            prev.map((c) => (c._id || c.chatId)?.toString()),
          );
          const uniqueNew = newChats.filter(
            (c) => !existingIds.has((c._id || c.chatId)?.toString()),
          );
          return [...prev, ...uniqueNew];
        });
        setPage(pageNum);
        setHasMore(newChats.length >= 20);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setIsSearching(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchChatsFromApi(val, 1);
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchChatsFromApi("", 1);
  };

  const loadMoreChats = useCallback(() => {
    if (loadingMore || !hasMore || isSearching) return;
    fetchChatsFromApi(searchQuery, page + 1);
  }, [loadingMore, hasMore, isSearching, searchQuery, page, fetchChatsFromApi]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      loadMoreChats();
    }
  };

  useEffect(() => {
    if (!socket) return;
    const otherUsersId = displayedChats?.map(
      (c) =>
        c.participants?.find((p) => p.userId?._id !== currentUserId)?.userId
          ?._id,
    );

    socket.on("user-status-changed", ({ userId, online }) => {
      setOtherUsers((prevUsers) => ({
        ...prevUsers,
        ...(otherUsersId?.includes(userId) ? { [userId]: online } : {}),
      }));
    });
    return () => {
      socket.off("user-status-changed");
    };
  }, [socket, currentUserId, displayedChats]);

  const isEn = lang === "en";
  const searchPlaceholder = isEn
    ? "Search by name, email, or phone..."
    : "البحث باسم المستخدم، البريد، أو رقم الهاتف...";
  const searchingText = isEn ? "Searching..." : "جاري البحث...";
  const loadingText = isEn ? "Loading..." : "جاري التحميل...";
  const yesterdayText = isEn ? "Yesterday" : "امس";
  const youPrefix = isEn ? "You: " : "أنت : ";
  const estajerPrefix = isEn ? "Estajer: " : "استأجر : ";
  const supportName = isEn ? "Estajer Support" : "دعم استأجر";

  const formatMessageDate = (date) => {
    if (isToday(new Date(date))) return format(new Date(date), "h:mm a");
    if (isYesterday(new Date(date))) return yesterdayText;
    return format(new Date(date), "MM dd");
  };

  const SUPPORT_AVATAR =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1757980493/final-logo-with-slogan--estajer--english_k4cwvh_rmcy09_rdlor1_jdycus.webp";

  return (
    <div className="h-full flex flex-col">
      <div className="pt-4 px-6 pb-4 border-b border-surfaceBlue">
        <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-1.2 font-semibold mb-3">
          {t("title")}
        </h1>
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          isClearable
          placeholder={searchPlaceholder}
          size="sm"
          radius="md"
        />
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto flex-1"
      >
        {/* Pinned: Estajer Support */}
        {supportChat &&
          (() => {
            const msgs = supportChat.messages || [];
            const lastMsg = msgs[msgs.length - 1];
            const isSelected = selectedChat?._type === "support";
            const hasUnread = msgs.some(
              (m) => m.role !== "user" && m.state === "sent",
            );
            return (
              <div
                key="support"
                onClick={() =>
                  onSelectChat({ ...supportChat, _type: "support" })
                }
                className={`flex gap-2 items-center p-4 cursor-pointer border-b border-b-surfaceBlue ${
                  isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={SUPPORT_AVATAR}
                    alt={supportName}
                    className="rounded-full w-[50px] h-[50px] object-contain p-0.5 border border-gray-100 bg-white"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm truncate">
                      {supportName}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {lastMsg && formatMessageDate(lastMsg.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm text-gray-500 truncate">
                      {lastMsg?.content?.substring(0, 35) ||
                        t("supportWelcome")}
                    </span>
                    {hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

        {isSearching ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-3">
            <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">{searchingText}</span>
          </div>
        ) : displayedChats.length > 0 ? (
          <>
            {displayedChats.map((chat) => {
              const otherParticipant = chat.participants?.find(
                (p) => p.userId?._id !== currentUserId,
              );
              const isSelected = selectedChat?.chatId === chat.chatId;
              const lastMessage = chat.messages?.[0];

              return (
                <div
                  key={chat.chatId || chat._id}
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
                        {lastMessage &&
                          formatMessageDate(lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {lastMessage?.isAdmin
                        ? estajerPrefix
                        : lastMessage?.sender === currentUserId
                          ? youPrefix
                          : ""}
                      {lastMessage?.content?.substring(0, 30)}...
                    </div>
                  </div>
                </div>
              );
            })}
            {loadingMore && (
              <div className="flex items-center justify-center p-4 text-xs text-gray-400 gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>{loadingText}</span>
              </div>
            )}
          </>
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
