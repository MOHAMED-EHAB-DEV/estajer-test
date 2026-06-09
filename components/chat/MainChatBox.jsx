"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useUser } from "@/context/UserContext";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { removeLastWord } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";
import WelcomeCover from "./WelcomeCover";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ProductSearch from "./ProductSearch";
import ChatInput from "./ChatInput";
import {
  detectPhoneNumber,
  SAUDI_PHONE_REGEX,
  detectContactSolicitation,
} from "@/lib/chatUtils";
import ChatNotificationBanner from "./ChatNotificationBanner";

const ADMIN_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1757980493/final-logo-with-slogan--estajer--english_k4cwvh_rmcy09_rdlor1_jdycus.webp";
const ADMIN_NAME = "estajer";

const CONTACT_WARNING_MESSAGE = `⚠️ يرجى العلم ⚠️
- يمنع منعا باتا مشاركة اي وسائل او ارقام تواصل قبل اتمام الطلب
- نرجو الاستفسار عن جميع المعلومات قبل اتمام الطلب
- مشاركة اي بيانات تواصل تعتبر مخالفة لسياسة المنصة
- بيانات التوصيل والموقع وجميع المعلومات الخاصة تظهر بعد اتمام الطلب
شكرا لثقتكم ⭐`;

export default function MainChatBox({
  currentUserId,
  userFullName,
  otherUserId,
  onClose,
  selectedChat,
  userAvatar,
  small,
  otherUserData,
  translate,
  aiAssistant,
  lang,
  visitorName,
  setVisitorName,
  initialProduct,
}) {
  const { socket } = useUser();
  const t = useTranslations(translate);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [otherUserAvatar, setOtherUserAvatar] = useState("");
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [lastSeen, setLastSeen] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const messageTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductForSend, setSelectedProductForSend] = useState(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    if (initialProduct) setSelectedProductForSend(initialProduct);
  }, [initialProduct]);

  const currentPathProductId = pathname?.match(/_ref_([a-z0-9]+)/)?.[1];

  useEffect(() => {
    if (!small && !aiAssistant) return;
    if (!pathname) return;
    if (prevPathRef.current === pathname) return;

    prevPathRef.current = pathname;
    onClose?.();
  }, [pathname, small, aiAssistant, onClose]);

  useEffect(() => {
    if (typeof document !== "undefined" && small) {
      document.body.classList.add("overflow-hidden");
      document.body.classList.add("md:overflow-auto");
    }
    return () => {
      if (typeof document !== "undefined" && small) {
        document.body.classList.remove("overflow-hidden");
        document.body.classList.remove("md:overflow-auto");
      }
    };
  }, [small]);

  useEffect(() => {
    if (!currentUserId || !otherUserId || aiAssistant) return;

    fetch(`/api/chat/check-active-order?otherUserId=${otherUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHasActiveOrder(data.hasActiveOrder);
          setContactInfo(data.contactInfo || null);
        }
      })
      .catch((err) => console.error("Error checking active order:", err));
  }, [currentUserId, otherUserId, aiAssistant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          if (!aiAssistant && messageId && unreadMessages.includes(messageId)) {
            fetch("/api/chat", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chatId, messageIds: [messageId] }),
            })
              .then(() =>
                setUnreadMessages((p) => p.filter((id) => id !== messageId)),
              )
              .catch((error) =>
                console.error("Error marking message as read:", error),
              );
          }
        }
      });
    });
    const messageElements = document.querySelectorAll(".message-item");
    messageElements.forEach((el) => observer.observe(el));
    return () => {
      messageElements.forEach((el) => observer.unobserve(el));
    };
  }, [messages, unreadMessages, aiAssistant, chatId]);

  useEffect(() => {
    if (!socket || !newMessage) return;
    socket.emit("typing", { chatId, userId: currentUserId });
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId, userId: currentUserId });
    }, 1000);
  }, [newMessage, socket, chatId, currentUserId]);

  useEffect(() => {
    if (aiAssistant) return;
    const markMessagesAsRead = async () => {
      const unreadMessageIds = messages
        .filter(
          (msg) =>
            (msg.sender._id !== currentUserId || msg.isAdmin) &&
            msg.state !== "read",
        )
        .map((msg) => msg._id);

      if (unreadMessageIds.length === 0) return;

      try {
        await fetch("/api/chat", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, messageIds: unreadMessageIds }),
        });

        setMessages((prev) =>
          prev.map((msg) =>
            unreadMessageIds.includes(msg._id)
              ? { ...msg, state: "read" }
              : msg,
          ),
        );

        socket?.emit("messages-read", {
          chatId,
          messageIds: unreadMessageIds,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    if (document.visibilityState === "visible") {
      markMessagesAsRead();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markMessagesAsRead();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [messages, currentUserId, chatId, socket, aiAssistant]);

  useEffect(() => {
    if (aiAssistant) {
      const generatedChatId = `ai_${currentUserId}`;
      setChatId(generatedChatId);
      fetch(`/api/assistant/rag`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json();

          const msgs = (data?.messages || []).map((m) =>
            m.role === "user"
              ? {
                  sender: { _id: currentUserId, fullName: t("chat.you") },
                  content: m.content,
                  timestamp: m.timestamp,
                  state: "read",
                }
              : {
                  sender: { _id: otherUserId, fullName: otherUserName },
                  content: m.content,
                  timestamp: m.timestamp,
                  state: "read",
                  aiData: m?.aiData,
                },
          );
          setMessages([
            {
              sender: { _id: otherUserId, fullName: otherUserName },
              content: t("chat.hello", {
                name: visitorName?.split(" ")[0] || "",
              }),
              timestamp: Date.now(),
              state: "read",
            },
            ...msgs,
          ]);
        })
        .catch(() => {});
      return;
    }

    if (!socket) return;
    const participants = [currentUserId, otherUserId].sort();
    const generatedChatId = participants.join("_");
    setChatId(generatedChatId);
    socket.emit("join-room", generatedChatId);

    fetch(`/api/chat?chatId=${generatedChatId}`)
      .then(async (chatRes) => {
        const chatData = await chatRes.json();
        if (chatData.error)
          toast.error(ToastMessage(chatData.error), { toastId: "load-error" });
        setMessages(chatData.messages || []);
      })
      .catch((error) => {
        toast.error(ToastMessage(error.message || "Failed to load messages"), {
          toastId: "load-error",
        });
      });

    socket.on(
      "new-message",
      ({ message }) =>
        message?.sender._id !== currentUserId &&
        setMessages((prev) => [...prev, message]),
    );

    return () => {
      if (generatedChatId) socket.emit("leave-chat", generatedChatId);
      socket.off("new-message");
    };
  }, [
    socket,
    currentUserId,
    otherUserId,
    aiAssistant,
    visitorName,
    otherUserName,
  ]);

  useEffect(() => {
    if (aiAssistant || !socket) return;

    socket.on("user-typing", ({ userId }) => {
      if (userId !== currentUserId) {
        setIsTyping(true);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

    socket.on("user-stopped-typing", ({ userId }) => {
      if (userId !== currentUserId) {
        setIsTyping(false);
      }
    });

    socket.on("messages-marked-read", ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, state: "read" } : msg,
        ),
      );
    });

    return () => {
      socket.off("user-typing");
      socket.off("user-stopped-typing");
      socket.off("messages-marked-read");
    };
  }, [socket, currentUserId, aiAssistant]);

  useEffect(() => {
    if (aiAssistant || !socket) return;
    socket.on(
      "user-status-changed",
      ({ userId, online, lastSeen: lastSeenTime }) => {
        if (userId === otherUserId) {
          setOtherUserOnline(online);
          setLastSeen(lastSeenTime);
        }
      },
    );
    return () => {
      socket.off("user-status-changed");
    };
  }, [socket, otherUserId, aiAssistant]);

  useEffect(() => {
    if (selectedChat) {
      const otherUser = selectedChat.participants.find(
        (p) => p?.userId?._id === otherUserId,
      );
      setOtherUserAvatar(otherUser?.userId?.avatar);
      setOtherUserName(otherUser?.userId?.fullName || "");
      setOtherUserOnline(otherUser?.userId?.isOnline || false);
      setLastSeen(otherUser?.userId?.lastSeen || null);
    }
    if (otherUserData) {
      setOtherUserAvatar(otherUserData?.avatar);
      setOtherUserName(otherUserData?.fullName || "");
      setOtherUserOnline(otherUserData?.isOnline || false);
      setLastSeen(otherUserData?.lastSeen || null);
    }
  }, [selectedChat, otherUserId]);

  const createOverflowRef = useCallback(
    (messageId) => {
      return (element) => {
        if (!element) return;
        requestAnimationFrame(() => {
          if (!element) return;
          try {
            const isOverflowing =
              element.scrollHeight > element.clientHeight + 10;
            if (isOverflowing && !expandedMessages.has(messageId)) {
              element.classList.add("has-more");
            }
          } catch (error) {
            console.warn("Error in overflow detection:", error);
          }
        });
      };
    },
    [expandedMessages],
  );

  const fetchProducts = useCallback(
    async (query = "") => {
      if (!currentUserId || !otherUserId) return;
      setLoadingProducts(true);
      try {
        const participantIds = [currentUserId, otherUserId];
        const responses = await Promise.all(
          participantIds.map((uid) =>
            fetch(
              `/api/products?userId=${uid}&lang=${lang}&limit=50&name=${query}&compressed=true&fields=images,owner,nameAr,nameEn,rental,pricingModel,location,addressAr,addressEn`,
            ).then((res) => res.json()),
          ),
        );

        const allProducts = responses
          .map((r) => r.data || [])
          .flat()
          .filter(
            (p, index, self) =>
              index === self.findIndex((t) => t._id === p._id),
          );

        setAvailableProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    },
    [currentUserId, otherUserId, lang],
  );

  useEffect(() => {
    if (showProductSearch) {
      fetchProducts(productSearchQuery);
    }
  }, [showProductSearch, productSearchQuery, fetchProducts]);

  const sendProduct = (product) => {
    setSelectedProductForSend(product);
    setShowProductSearch(false);
    setProductSearchQuery("");
  };

  const sendCurrentProduct = async () => {
    if (!currentPathProductId) return;
    try {
      const res = await fetch(
        `/api/products/${currentPathProductId}?lang=${lang}`,
      );
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedProductForSend(data.data);
        setShowProductSearch(false);
      }
    } catch (error) {
      console.error("Error sending current product:", error);
    }
  };

  const sendMessage = async () => {
    if (
      (!newMessage.trim() && !selectedProductForSend) ||
      newMessage.length > 500
    )
      return;

    if (
      !hasActiveOrder &&
      detectContactSolicitation(newMessage) &&
      !aiAssistant
    ) {
      const tempId = `rejected-${Date.now()}`;
      const rejectedMsg = {
        _id: tempId,
        sender: { _id: currentUserId, fullName: userFullName },
        content: newMessage,
        timestamp: new Date().toISOString(),
        state: "sent",
        isRejected: true,
      };

      setMessages((prev) => [...prev, rejectedMsg]);
      setNewMessage("");
      setSelectedProductForSend(null);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            _id: `admin-warn-${Date.now()}`,
            sender: { _id: "admin-system", fullName: ADMIN_NAME },
            content: CONTACT_WARNING_MESSAGE,
            timestamp: new Date().toISOString(),
            state: "read",
            isAdmin: true,
          },
        ]);
      }, 600);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...msg, isVanishing: true } : msg,
          ),
        );
      }, 1500);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      }, 2000);

      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastMessageTime < 1000) {
      return toast.warning(ToastMessage(t("chat.waitWarning")), {
        toastId: "wait-warning",
      });
    }

    setLastMessageTime(currentTime);

    if (
      !hasActiveOrder &&
      detectPhoneNumber(newMessage, messages, currentUserId, t)
    ) {
      setNewMessage((prev) => prev.replace(SAUDI_PHONE_REGEX, "********"));
      return toast.warning(ToastMessage(t("chat.phoneNumberWarning")), {
        toastId: "phone-warning",
      });
    }

    const productData = selectedProductForSend
      ? {
          type: "product",
          id: selectedProductForSend._id,
          product: selectedProductForSend,
        }
      : null;

    const tempMessage = {
      sender: { _id: currentUserId, fullName: userFullName },
      content: newMessage,
      timestamp: new Date().toISOString(),
      state: "loading",
      aiData: productData,
    };

    const sentMessage = newMessage;
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setSelectedProductForSend(null);

    try {
      if (aiAssistant) {
        const historySeed = messages.slice(-4);
        const historyText = [
          ...historySeed,
          { sender: { _id: currentUserId }, content: newMessage },
        ]
          .map((m) => {
            const role =
              m.sender && m.sender._id === currentUserId ? "User" : "Assistant";
            return `${role}: ${m.content}`;
          })
          .join("\n");
        const res = await fetch("/api/assistant/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: historyText,
            userMessage: newMessage,
            name: visitorName,
            lang,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!res.ok) throw new Error("Failed to send AI message");

        const assistantText = data?.text || "";
        setMessages((prev) =>
          prev.map((msg) =>
            msg === tempMessage ? { ...msg, state: "sent" } : msg,
          ),
        );
        const assistantMessage = {
          sender: { _id: otherUserId, fullName: otherUserName },
          content: assistantText,
          timestamp: new Date().toISOString(),
          state: "sent",
          aiData: data?.aiData,
          open: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otherUserId,
            message: newMessage || "",
            aiData: productData,
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg === tempMessage
              ? { ...msg, state: "sent", _id: data.message._id }
              : msg,
          ),
        );
        socket.emit("send-message", {
          roomId: chatId,
          message: { ...tempMessage, state: "sent", _id: data.message._id },
        });
      }
    } catch (error) {
      toast.error(ToastMessage(error.message || "Failed to send message"), {
        toastId: "send-error",
      });
      setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
    }
  };

  const formatLastSeen = (date) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ar,
      });
    } catch (error) {
      return "";
    }
  };

  const getUserAvatar = ({ id, isAdmin }) => {
    if (isAdmin) return ADMIN_AVATAR;
    if (id === currentUserId)
      return (
        userAvatar ||
        "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp"
      );
    return (
      otherUserAvatar ||
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp"
    );
  };

  const getUserName = ({ id, isAdmin }) => {
    if (isAdmin) return ADMIN_NAME;
    if (id === currentUserId) return t("chat.you");
    return aiAssistant
      ? otherUserName
      : removeLastWord(otherUserName).split(" ")[0];
  };

  return (
    <div
      className={`${
        small
          ? "fixed bottom-0 md:start-2 start-0 md:px-0 w-[440px] h-[670px] max-w-full max-h-dvh shadow-2xl"
          : "md:relative absolute h-full w-full bg-white"
      } rounded-t-xl flex flex-col flex-1 z-[99] border border-gray-200/50`}
    >
      <ChatHeader
        small={small}
        otherUserAvatar={otherUserAvatar}
        otherUserOnline={otherUserOnline}
        otherUserName={otherUserName}
        lastSeen={lastSeen}
        formatLastSeen={formatLastSeen}
        t={t}
        onClose={onClose}
        aiAssistant={aiAssistant}
        hasActiveOrder={hasActiveOrder}
        contactInfo={contactInfo}
      />

      {!visitorName && aiAssistant ? (
        <WelcomeCover
          visitorName={visitorName}
          setVisitorName={setVisitorName}
          translate={translate}
        />
      ) : (
        <div className="flex flex-col flex-1 relative overflow-hidden">
          {!aiAssistant && messages.length > 0 && (
            <ChatNotificationBanner t={t} isApp={false} />
          )}
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            aiAssistant={aiAssistant}
            messagesEndRef={messagesEndRef}
            t={t}
            translate={translate}
            lang={lang}
            visitorName={visitorName}
            getUserAvatar={getUserAvatar}
            getUserName={getUserName}
            createOverflowRef={createOverflowRef}
            expandedMessages={expandedMessages}
            setExpandedMessages={setExpandedMessages}
            isTyping={isTyping}
            small={small}
            textareaRef={textareaRef}
          />

          <ProductSearch
            showProductSearch={showProductSearch}
            setShowProductSearch={setShowProductSearch}
            productSearchQuery={productSearchQuery}
            setProductSearchQuery={setProductSearchQuery}
            currentPathProductId={currentPathProductId}
            sendCurrentProduct={sendCurrentProduct}
            pathname={pathname}
            loadingProducts={loadingProducts}
            availableProducts={availableProducts}
            sendProduct={sendProduct}
            t={t}
          />

          <ChatInput
            small={small}
            selectedProductForSend={selectedProductForSend}
            setSelectedProductForSend={setSelectedProductForSend}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            textareaRef={textareaRef}
            showProductSearch={showProductSearch}
            setShowProductSearch={setShowProductSearch}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
