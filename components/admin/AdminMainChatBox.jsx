"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import ConfirmModal from "../dashboard/ConfirmModal";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

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
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.messages.${text}`);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

    // Rate limiting - 1 second between messages
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      toast.warning(ToastMessage(trans("chat.waitWarning")));
      return;
    }

    setLastMessageTime(now);

    // Add message locally with loading state
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
      const url = aiAssistant ? "/api/admin/aichat" : "/api/admin/chat";
      const body = { chatId, message: newMessage, isAdmin: true };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      // Update message state to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg === tempMessage
            ? { ...msg, state: "sent", _id: data.message?._id }
            : msg,
        ),
      );
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
      const res = await fetch(
        `/api/admin/chat?chatId=${chatId}&messageId=${messageToDelete._id}`,
        {
          method: "DELETE",
        },
      );

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedChat) textareaRef.current?.focus();
    if (!selectedChat) return;
    if (aiAssistant) {
      setChatId(selectedChat.sessionId);
      fetch(`/api/admin/aichat?sessionId=${selectedChat.sessionId}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json();
          const msgs = (data?.messages || []).map((m) =>
            m.role === "user"
              ? {
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

  const getUserAvatar = ({ id, isAdmin, msg }) => {
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
    if (aiAssistant) {
      const isAssistant = msg?.sender?._id === "assistant";
      if (isAssistant) {
        return (
          msg?.sender?.fullName || (isAdmin ? ADMIN_NAME : "Estajer Assistant")
        );
      }
      return aiUser?.fullName || selectedChat?.visitorName || "زائر";
    }
    if (isAdmin) return ADMIN_NAME;
    const participant = participants.find((p) => p?.userId?._id === id);
    return participant?.userId?.fullName;
  };

  return (
    <div className="md:relative absolute h-full w-full bg-white rounded-t-lg flex flex-col flex-1 z-40 border border-gray-200/50">
      <ChatHeader
        isAdminChat={true}
        participant1={participant1}
        participant2={participant2}
        aiAssistant={aiAssistant}
        onClose={onClose}
      />
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={"assistant"}
          aiAssistant={aiAssistant}
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
          isTyping={false}
          small={false}
          textareaRef={textareaRef}
          isAdminChat={true}
          handleDeleteClick={handleDeleteClick}
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
        t={trans}
      />
    </div>
  );
}
