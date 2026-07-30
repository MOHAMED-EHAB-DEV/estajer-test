"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { format, isToday, isYesterday } from "date-fns";
import { useTranslations } from "@/hooks/useTranslations";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import { Messages } from "@/components/ui/svgs/icons/MessagesSvg";
import { ar } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const Ai_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1763326241/abc0121a-15f7-40ba-adf3-07b2e2eba8d1_ev61fp.webp";
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp";

export default function AdminChatsList({
  onSelectChat,
  selectedChat,
  chats = [],
  translate,
  aiAssistant = false,
  supportMode = false,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.messages.${text}`);

  const [displayedChats, setDisplayedChats] = useState(chats);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(chats?.length >= 20);
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

  const fetchChatsFromApi = useCallback(
    async (query, pageNum = 1) => {
      if (pageNum === 1) {
        setIsSearching(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const endpoint = supportMode
          ? "/api/admin/support/list"
          : aiAssistant
          ? "/api/admin/aichat/list"
          : "/api/admin/chat/list";

        const url = `${endpoint}?page=${pageNum}&limit=20&client=true${
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
              prev.map((c) => (c._id || c.chatId || c.sessionId)?.toString())
            );
            const uniqueNew = newChats.filter(
              (c) =>
                !existingIds.has(
                  (c._id || c.chatId || c.sessionId)?.toString()
                )
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
    },
    [supportMode, aiAssistant]
  );

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

  const title = supportMode
    ? "رسائل الدعم والتغذية الراجعة"
    : aiAssistant
    ? "رسائل الذكاء الاصطناعي"
    : t("title");

  const isSelected = (chat) => {
    if (supportMode)
      return (
        selectedChat?.userId?._id === chat.userId?._id ||
        selectedChat?._id === chat._id
      );
    if (aiAssistant) return selectedChat?.sessionId === chat.sessionId;
    return selectedChat?.chatId === chat.chatId;
  };

  const formatMessageDate = (date) => {
    if (isToday(new Date(date))) return format(new Date(date), "h:mm a");
    if (isYesterday(new Date(date))) return "امس";
    return format(new Date(date), "M/d", { locale: ar });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pt-6 px-6 pb-4 border-b border-surfaceBlue">
        <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.4rem] font-semibold mb-3">
          {title}
        </h1>
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          isClearable
          placeholder="البحث باسم المستخدم أو البريد الإلكتروني..."
          size="sm"
          radius="md"
        />
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto flex-1 outline-none border-none"
      >
        {isSearching ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-3">
            <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">جاري البحث...</span>
          </div>
        ) : displayedChats.length > 0 ? (
          <>
            {displayedChats.map((chat) => {
              const sel = isSelected(chat);
              const lastMessage = chat.messages?.[0];

              // Support mode: show user info
              if (supportMode) {
                const user = chat.userId;
                const feedbackCount = chat.feedbackItems?.length || 0;
                return (
                  <div
                    key={chat._id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center p-4 cursor-pointer border-b border-b-surfaceBlue ${
                      sel ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="shrink-0 me-3">
                      <Image
                        src={anyImgUrl({
                          src: user?.avatar || DEFAULT_AVATAR,
                          size: 100,
                        })}
                        alt={user?.fullName || "User"}
                        width={45}
                        height={45}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-sm truncate">
                          {user?.fullName || "مستخدم"}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {lastMessage &&
                            formatMessageDate(lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-gray-500 truncate">
                          {lastMessage?.content?.substring(0, 40)}
                        </span>
                        {feedbackCount > 0 && (
                          <span className="shrink-0 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {feedbackCount} ملاحظة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

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
                  key={chat.sessionId || chat.chatId || chat._id}
                  onClick={() => onSelectChat(chat)}
                  className={`flex items-center p-4 cursor-pointer border-b border-b-surfaceBlue ${
                    sel ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center relative">
                    <Image
                      src={anyImgUrl({
                        src:
                          participants?.[0]?.userId?.avatar || DEFAULT_AVATAR,
                        size: 100,
                      })}
                      alt={participants?.[0]?.userId?.fullName || "User"}
                      width={45}
                      height={45}
                      className="border-4 z-10 rounded-full border-white"
                      unoptimized
                    />
                    <Image
                      src={anyImgUrl({
                        src:
                          participants?.[1]?.userId?.avatar || DEFAULT_AVATAR,
                        size: 100,
                      })}
                      alt={participants?.[1]?.userId?.fullName || "User"}
                      width={35}
                      height={35}
                      className="rounded-full translate-x-3"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-semibold text-sm flex flex-col">
                        <span>{`${
                          participants?.[0]?.userId?.fullName || ""
                        }`}</span>
                        <span>{`و ${
                          participants?.[1]?.userId?.fullName || ""
                        }`}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {lastMessage &&
                          formatMessageDate(lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {lastMessage?.content?.substring(0, 40)}...
                    </div>
                  </div>
                </div>
              );
            })}
            {loadingMore && (
              <div className="flex items-center justify-center p-4 text-xs text-gray-400 gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>جاري التحميل...</span>
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
