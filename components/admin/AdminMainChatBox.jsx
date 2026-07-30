"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import ConfirmModal from "../dashboard/ConfirmModal";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

import { useUser } from "@/context/UserContext";

const ADMIN_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1757980493/final-logo-with-slogan--estajer--english_k4cwvh_rmcy09_rdlor1_jdycus.webp";
const ADMIN_NAME = "Estajer";

const ASSISTANT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1763326241/abc0121a-15f7-40ba-adf3-07b2e2eba8d1_ev61fp.webp";
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp";

export default function AdminMainChatBox({
  onClose,
  selectedChat,
  translate,
  aiAssistant = false,
  supportMode = false,
}) {
  const { socket } = useUser();
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.messages.${text}`);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chatDetails, setChatDetails] = useState(null);
  const [isBanning, setIsBanning] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [isTogglingAi, setIsTogglingAi] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Create a ref callback for overflow detection
  const createOverflowRef = useCallback(
    (messageId) => {
      return (element) => {
        if (!element) return;

        // Use requestAnimationFrame to defer DOM queries
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

  const participants = selectedChat?.participants || [];
  const participant1 = aiAssistant
    ? selectedChat.user || { fullName: selectedChat.visitorName }
    : participants[0]?.userId;
  const participant2 = participants[1]?.userId;
  const aiUser = selectedChat?.user;

  const sendMessage = async () => {
    if (!newMessage.trim() || newMessage.length > 500) return;

    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      toast.warning(ToastMessage(trans("chat.waitWarning")));
      return;
    }
    setLastMessageTime(now);

    const tempMessage = {
      sender: { _id: "assistant", fullName: ADMIN_NAME },
      content: newMessage,
      timestamp: new Date().toISOString(),
      isAdmin: true,
      state: "loading",
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      let url, body;
      if (supportMode) {
        url = "/api/admin/support?client=true";
        body = {
          userId: selectedChat.userId?._id || selectedChat.userId,
          message: newMessage,
        };
      } else if (aiAssistant) {
        url = "/api/admin/aichat";
        body = { chatId, message: newMessage, isAdmin: true };
      } else {
        url = "/api/admin/chat";
        body = { chatId, message: newMessage, isAdmin: true };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg === tempMessage
            ? { ...msg, state: "sent", _id: data.message?._id }
            : msg,
        ),
      );
      // Support: admin message auto-disables aiMode and emits socket event
      if (supportMode) {
        setAiMode(false);
        const targetUserId = selectedChat.userId?._id || selectedChat.userId;
        if (socket && targetUserId) {
          const roomId = `support_${targetUserId}`;
          const sentAdminMsg = data.message || {
            _id: tempMessage._id,
            role: "admin",
            content: newMessage,
            state: "sent",
            timestamp: new Date().toISOString(),
          };
          socket.emit("stop-typing", { chatId: roomId, userId: "assistant" });
          socket.emit("send-message", { roomId, message: sentAdminMsg });
          socket.emit("support-admin-message", { message: sentAdminMsg });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
      toast.error(ToastMessage(trans("chat.failedToSend")));
    }
  };

  const handleDeleteClick = (msg) => {
    setMessageToDelete(msg);
    setDeleteModalOpen(true);
  };

  const deleteMessage = async () => {
    if (!chatId || !messageToDelete?._id) return;

    setIsDeleting(true);
    try {
      const url = aiAssistant
        ? `/api/admin/aichat?sessionId=${chatId}&messageId=${messageToDelete._id}`
        : supportMode
          ? `/api/admin/support?userId=${selectedChat.userId?._id || selectedChat.userId}&messageId=${messageToDelete._id}&client=true`
          : `/api/admin/chat?chatId=${chatId}&messageId=${messageToDelete._id}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete message");

      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageToDelete._id),
      );
      toast.success(ToastMessage(trans("admin.messages.deleteSuccess")));
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(ToastMessage(trans("admin.messages.deleteError")));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleChatBan = async () => {
    if (!chatId || isBanning) return;
    setIsBanning(true);
    const isCurrentlyBanned = chatDetails?.spamCount >= 3;
    const action = isCurrentlyBanned ? "unban" : "ban";

    try {
      const res = await fetch("/api/admin/aichat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: chatId, action }),
      });

      if (!res.ok) throw new Error("Failed to update ban status");
      const data = await res.json();

      setChatDetails((prev) => ({ ...prev, spamCount: data.spamCount }));

      const successMsg = action === "ban" ? t("banSuccess") : t("unbanSuccess");
      toast.success(ToastMessage(successMsg));
    } catch (error) {
      console.error("Error toggling ban status:", error);
      const errorMsg = action === "ban" ? t("banError") : t("unbanError");
      toast.error(ToastMessage(errorMsg));
    } finally {
      setIsBanning(false);
    }
  };

  const messageTimeoutRef = useRef(null);
  const pendingReadMsgIdsRef = useRef([]);
  const targetUserId = supportMode
    ? selectedChat?.userId?._id || selectedChat?.userId
    : null;

  // Flush pending read messages when socket is available
  useEffect(() => {
    if (
      socket &&
      supportMode &&
      targetUserId &&
      pendingReadMsgIdsRef.current.length > 0
    ) {
      socket.emit("messages-read", {
        chatId: `support_${targetUserId}`,
        messageIds: pendingReadMsgIdsRef.current,
      });
      pendingReadMsgIdsRef.current = [];
    }
  }, [socket, supportMode, targetUserId]);

  // Socket: emit typing in supportMode when admin types
  useEffect(() => {
    if (!socket || !newMessage || !supportMode || !targetUserId) return;
    const roomId = `support_${targetUserId}`;
    socket.emit("typing", { chatId: roomId, userId: "assistant" });
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId: roomId, userId: "assistant" });
    }, 1000);
  }, [newMessage, socket, supportMode, targetUserId]);

  // Socket: join room & handle real-time events for supportMode
  useEffect(() => {
    if (!socket || !supportMode || !targetUserId) return;
    const roomId = `support_${targetUserId}`;
    socket.emit("join-room", roomId);

    const handleNewMessage = ({ message }) => {
      if (
        message &&
        (message.role === "user" || message.sender?._id === targetUserId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [
            ...prev,
            {
              _id: message._id,
              sender: {
                _id: targetUserId,
                fullName: chatDetails?.userId?.fullName || "مستخدم",
              },
              content: message.content,
              imageUrl: message.imageUrl,
              timestamp: message.timestamp,
              state: "sent",
              isAdmin: false,
            },
          ];
        });
      }
    };

    const handleUserTyping = ({ userId }) => {
      if (userId !== "assistant" && userId !== "admin") {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ userId }) => {
      if (userId !== "assistant" && userId !== "admin") {
        setIsTyping(false);
      }
    };

    const handleMessagesMarkedRead = ({ messageIds }) => {
      if (!messageIds || messageIds.length === 0) return;
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, state: "read" } : msg,
        ),
      );
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);
    socket.on("messages-marked-read", handleMessagesMarkedRead);

    return () => {
      socket.emit("leave-chat", roomId);
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
      socket.off("messages-marked-read", handleMessagesMarkedRead);
    };
  }, [socket, supportMode, targetUserId, chatDetails]);

  // Socket: emit messages-read when admin views unread user messages while tab is visible
  useEffect(() => {
    if (!socket || !supportMode || !targetUserId || messages.length === 0)
      return;

    const markMessagesAsRead = () => {
      if (document.visibilityState !== "visible") return;
      const unreadUserMsgIds = messages
        .filter((m) => !m.isAdmin && m.state !== "read")
        .map((m) => m._id);

      if (unreadUserMsgIds.length === 0) return;

      const roomId = `support_${targetUserId}`;
      socket.emit("messages-read", {
        chatId: roomId,
        messageIds: unreadUserMsgIds,
      });
    };

    markMessagesAsRead();

    const handleVisibilityChange = () => {
      markMessagesAsRead();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [messages, socket, supportMode, targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedChat) textareaRef.current?.focus();
    if (!selectedChat) return;

    if (supportMode) {
      const userId = selectedChat.userId?._id || selectedChat.userId;
      setChatId(userId);
      setAiMode(selectedChat.aiMode ?? true);
      fetch(`/api/admin/support?userId=${userId}&client=true`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json();
          setChatDetails(data);
          if (data?.readMsgIds?.length > 0) {
            pendingReadMsgIdsRef.current = data.readMsgIds;
            if (socket) {
              socket.emit("messages-read", {
                chatId: `support_${userId}`,
                messageIds: data.readMsgIds,
              });
              pendingReadMsgIdsRef.current = [];
            }
          }
          const mapped = (data?.messages || []).map((m) => ({
            _id: m._id,
            sender:
              m.role === "user"
                ? {
                    _id: data.userId?._id || "user",
                    fullName: data.userId?.fullName || "مستخدم",
                  }
                : {
                    _id: "assistant",
                    fullName: m.role === "admin" ? ADMIN_NAME : "AI Support",
                  },
            content: m.content,
            imageUrl: m.imageUrl,
            timestamp: m.timestamp,
            state: m.state,
            isAdmin: m.role !== "user",
          }));
          setMessages(mapped);
        })
        .catch(() => {});
      return;
    }

    if (aiAssistant) {
      setChatId(selectedChat.sessionId);
      fetch(`/api/admin/aichat?sessionId=${selectedChat.sessionId}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json();
          setChatDetails(data);
          const msgs = (data?.messages || []).map((m) =>
            m.role === "user"
              ? {
                  _id: m._id,
                  sender: {
                    _id: aiUser?._id || "user",
                    fullName:
                      aiUser?.fullName || selectedChat?.visitorName || "زائر",
                  },
                  content: m.content,
                  timestamp: m.timestamp,
                  state: "read",
                }
              : {
                  _id: m._id,
                  sender: {
                    _id: "assistant",
                    fullName: m.isAdmin ? "Estajer" : "Estajer Assistant",
                  },
                  content: m.content,
                  timestamp: m.timestamp,
                  state: "read",
                  aiData: m?.aiData,
                  isAdmin: m.isAdmin,
                },
          );
          setMessages(msgs);
        })
        .catch(() => {});
      return;
    }

    setChatId(selectedChat.chatId);
    fetch(`/api/chat?chatId=${selectedChat.chatId}`)
      .then(async (chatRes) => {
        if (!chatRes.ok) {
          if (chatRes.status !== 404) {
            console.error("Error loading messages:", await chatRes.text());
          }
          return;
        }
        const chatData = await chatRes.json();
        setMessages(chatData.messages || []);
      })
      .catch((error) => {
        console.error("Error fetching chat data:", error);
      });
  }, [selectedChat, aiAssistant]);

  const getUserAvatar = ({ id, isAdmin, msg }) => {
    if (supportMode) {
      if (msg?.sender?._id === "assistant") return ADMIN_AVATAR;
      return chatDetails?.userId?.avatar || DEFAULT_AVATAR;
    }
    if (aiAssistant) {
      const isAssistant = msg?.sender?._id === "assistant";
      if (isAssistant) {
        return isAdmin ? ADMIN_AVATAR : ASSISTANT_AVATAR;
      }
      return aiUser?.avatar || DEFAULT_AVATAR;
    }
    if (isAdmin) return ADMIN_AVATAR;
    const participant = participants.find((p) => p?.userId?._id === id);
    return participant?.userId?.avatar || DEFAULT_AVATAR;
  };

  const getUserName = ({ id, isAdmin, msg }) => {
    if (supportMode) {
      if (msg?.sender?._id === "assistant")
        return msg?.sender?.fullName || ADMIN_NAME;
      return chatDetails?.userId?.fullName || "مستخدم";
    }
    if (aiAssistant) {
      const isAssistant = msg?.sender?._id === "assistant";
      if (isAssistant)
        return (
          msg?.sender?.fullName || (isAdmin ? ADMIN_NAME : "Estajer Assistant")
        );
      return aiUser?.fullName || selectedChat?.visitorName || "زائر";
    }
    if (isAdmin) return ADMIN_NAME;
    const participant = participants.find((p) => p?.userId?._id === id);
    return participant?.userId?.fullName;
  };

  const toggleAiMode = async () => {
    if (!supportMode || isTogglingAi) return;
    setIsTogglingAi(true);
    try {
      const res = await fetch("/api/admin/support?client=true", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedChat.userId?._id || selectedChat.userId,
          aiMode: !aiMode,
        }),
      });
      if (!res.ok) throw new Error();
      setAiMode((prev) => !prev);
    } catch (_) {
      toast.error(ToastMessage("Failed to toggle AI mode"));
    } finally {
      setIsTogglingAi(false);
    }
  };

  return (
    <div className="md:relative absolute h-full w-full bg-white rounded-t-lg flex flex-col flex-1 z-40 border border-gray-200/50">
      <ChatHeader
        isAdminChat={!supportMode}
        participant1={supportMode ? chatDetails?.userId : participant1}
        participant2={supportMode ? null : participant2}
        aiAssistant={aiAssistant}
        onClose={onClose}
        otherUserName={supportMode ? chatDetails?.userId?.fullName : undefined}
        otherUserAvatar={supportMode ? chatDetails?.userId?.avatar : undefined}
        small={false}
        otherUserOnline={false}
        formatLastSeen={() => ""}
        lastSeen={null}
        t={trans}
      />

      {/* Support mode: AI toggle + feedbackItems panel */}
      {supportMode && (
        <>
          <div className="px-4 py-2 flex justify-between items-center text-xs font-semibold border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${aiMode ? "bg-green-500" : "bg-orange-400"}`}
              />
              <span className={aiMode ? "text-green-700" : "text-orange-700"}>
                {aiMode ? "AI يتعامل مع المحادثة" : "أنت تتعامل مع المحادثة"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {chatDetails?.feedbackItems?.length > 0 && (
                <button
                  onClick={() => setFeedbackOpen((p) => !p)}
                  className="text-primary underline text-xs"
                >
                  {feedbackOpen ? "إخفاء" : "عرض"} الملاحظات (
                  {chatDetails.feedbackItems.length})
                </button>
              )}
              <button
                onClick={toggleAiMode}
                disabled={isTogglingAi}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  aiMode
                    ? "bg-orange-100 hover:bg-orange-200 text-orange-800"
                    : "bg-green-100 hover:bg-green-200 text-green-800"
                }`}
              >
                {aiMode ? "تولي المحادثة" : "إعادة للـ AI"}
              </button>
            </div>
          </div>
          {feedbackOpen && chatDetails?.feedbackItems?.length > 0 && (
            <div className="px-4 py-3 border-b bg-orange-50 text-xs space-y-1.5 max-h-40 overflow-y-auto">
              {chatDetails.feedbackItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.type === "bug"
                        ? "bg-red-100 text-red-700"
                        : item.type === "suggestion"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-gray-700 leading-snug">
                    {item.summary}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {aiAssistant && chatDetails && (
        <>
          <div
            className={`px-6 py-2 flex justify-between items-center text-xs font-semibold border-b ${
              chatDetails.spamCount >= 3
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-green-50 text-green-700 border-green-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${chatDetails.spamCount >= 3 ? "bg-red-500" : "bg-green-500"}`}
              />
              <span>
                {chatDetails.spamCount >= 3
                  ? t("bannedStatus")
                  : t("activeStatus")}
              </span>
              {chatDetails.spamCount > 0 && chatDetails.spamCount < 3 && (
                <span className="text-gray-500">
                  ({t("warningsCount")}: {chatDetails.spamCount}/3)
                </span>
              )}
            </div>
            <button
              onClick={toggleChatBan}
              disabled={isBanning}
              className={`px-3 py-1 rounded transition-colors text-xs font-bold ${
                chatDetails.spamCount >= 3
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {chatDetails.spamCount >= 3 ? t("unbanChat") : t("banChat")}
            </button>
          </div>
          {(chatDetails.visitorContact ||
            (chatDetails.user &&
              (chatDetails.user.phone || chatDetails.user.email))) && (
            <div className="px-6 py-2 bg-orange-50 border-b border-orange-100 text-xs text-orange-950 flex items-center gap-2">
              <span className="font-bold">
                {trans("chat.contactInfo") || "معلومات التواصل"}:
              </span>
              <span>
                {chatDetails.visitorContact ||
                  [chatDetails.user?.phone, chatDetails.user?.email]
                    .filter(Boolean)
                    .join(" - ")}
              </span>
            </div>
          )}
        </>
      )}
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={"assistant"}
          aiAssistant={aiAssistant}
          supportMode={supportMode}
          messagesEndRef={messagesEndRef}
          t={trans}
          translate={translate}
          lang="ar"
          visitorName={selectedChat?.visitorName}
          getUserAvatar={getUserAvatar}
          getUserName={getUserName}
          createOverflowRef={createOverflowRef}
          expandedMessages={expandedMessages}
          setExpandedMessages={setExpandedMessages}
          isTyping={isTyping}
          small={false}
          textareaRef={textareaRef}
          isAdminChat={true}
          handleDeleteClick={handleDeleteClick}
          firstMessageSenderId={
            supportMode
              ? selectedChat?.userId?._id || selectedChat?.userId
              : undefined
          }
        />
        <ChatInput
          small={false}
          selectedProductForSend={null}
          setSelectedProductForSend={() => {}}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          textareaRef={textareaRef}
          showProductSearch={false}
          setShowProductSearch={() => {}}
          t={trans}
          isAdminChat={true}
          aiAssistant={aiAssistant}
          placeholder={
            aiAssistant ? trans("chat.typeMessage") : t("typePlaceholder")
          }
        />
      </div>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteMessage}
        title={trans("admin.messages.deleteTitle")}
        message={`${trans("admin.messages.deleteConfirm")}: "${messageToDelete?.content?.substring(0, 50)}${messageToDelete?.content?.length > 50 ? "..." : ""}"؟`}
        confirmText={trans("admin.messages.delete")}
        cancelText={trans("admin.messages.cancel")}
        type="delete"
        loading={isDeleting}
        disableScrollbarGutter={true}
        t={trans}
      />
    </div>
  );
}
