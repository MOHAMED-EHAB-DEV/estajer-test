"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { resizeImage } from "@/utils/ImageResizer";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import Button from "../ui/Button";
import { Send } from "../ui/svgs/icons/SendSvg";
import { Textarea } from "@/components/ui/Input";

const SUPPORT_AVATAR =
  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1757980493/final-logo-with-slogan--estajer--english_k4cwvh_rmcy09_rdlor1_jdycus.webp";
const SUPPORT_NAME = "Estajer Support";
const SUPPORT_ID = "estajer-support";

export default function SupportChatBox({
  currentUserId,
  userAvatar,
  userFullName,
  onClose,
  translate,
  lang,
  onUpdateSupportChat,
}) {
  const { socket } = useUser();
  const trans = useTranslations(translate);
  const t = (key) => trans(`dashboard.messages.${key}`);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null); // { preview, file }


  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const onUpdateSupportChatRef = useRef(onUpdateSupportChat);

  useEffect(() => {
    onUpdateSupportChatRef.current = onUpdateSupportChat;
  }, [onUpdateSupportChat]);

  // Sync with parent for list preview & unread status
  useEffect(() => {
    if (onUpdateSupportChatRef.current && messages.length > 0) {
      onUpdateSupportChatRef.current(messages);
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pendingReadMsgIdsRef = useRef([]);

  // Flush pending read messages when socket is available
  useEffect(() => {
    if (socket && currentUserId && pendingReadMsgIdsRef.current.length > 0) {
      socket.emit("messages-read", {
        chatId: `support_${currentUserId}`,
        messageIds: pendingReadMsgIdsRef.current,
      });
      pendingReadMsgIdsRef.current = [];
    }
  }, [socket, currentUserId]);

  // Load history on mount
  useEffect(() => {
    fetch("/api/support?client=true")
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.messages) return;
        setAiMode(data.aiMode ?? true);
        if (data.readMsgIds?.length > 0) {
          pendingReadMsgIdsRef.current = data.readMsgIds;
          if (socket) {
            socket.emit("messages-read", {
              chatId: `support_${currentUserId}`,
              messageIds: data.readMsgIds,
            });
            pendingReadMsgIdsRef.current = [];
          }
        }
        const mapped = data.messages.map((m) => ({
          _id: m._id,
          sender:
            m.role === "user"
              ? { _id: currentUserId, fullName: userFullName }
              : { _id: SUPPORT_ID, fullName: SUPPORT_NAME },
          content: m.content,
          imageUrl: m.imageUrl,
          timestamp: m.timestamp,
          state: m.state,
          role: m.role,
        }));
        setMessages(mapped);
      })
      .catch(() => {});
  }, [currentUserId, userFullName, socket]);

  const messageTimeoutRef = useRef(null);

  // Socket: typing indicator on user input
  useEffect(() => {
    if (!socket || !newMessage || !currentUserId) return;
    const room = `support_${currentUserId}`;
    socket.emit("typing", { chatId: room, userId: currentUserId });
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId: room, userId: currentUserId });
    }, 1000);
  }, [newMessage, socket, currentUserId]);

  // Socket: listen for admin messages, typing, and read events
  useEffect(() => {
    if (!socket || !currentUserId) return;
    const room = `support_${currentUserId}`;
    socket.emit("join-room", room);

    const handleAdminMessage = ({ message }) => {
      if (!message) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [
          ...prev,
          {
            _id: message._id,
            sender: { _id: SUPPORT_ID, fullName: SUPPORT_NAME },
            content: message.content,
            imageUrl: message.imageUrl,
            timestamp: message.timestamp,
            state: "sent",
            role: "admin",
          },
        ];
      });
      setAiMode(false);
    };

    const handleUserTyping = ({ userId }) => {
      if (userId !== currentUserId) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ userId }) => {
      if (userId !== currentUserId) {
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

    socket.on("support-admin-message", handleAdminMessage);
    socket.on("new-message", ({ message }) => {
      if (message && message.role === "admin") {
        handleAdminMessage({ message });
      }
    });
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);
    socket.on("messages-marked-read", handleMessagesMarkedRead);

    return () => {
      socket.emit("leave-chat", room);
      socket.off("support-admin-message", handleAdminMessage);
      socket.off("new-message");
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
      socket.off("messages-marked-read", handleMessagesMarkedRead);
    };
  }, [socket, currentUserId]);

  // Socket: emit messages-read when user views admin messages while tab is visible
  useEffect(() => {
    if (!socket || !currentUserId || messages.length === 0) return;

    const markMessagesAsRead = () => {
      if (document.visibilityState !== "visible") return;
      const unreadAdminMsgIds = messages
        .filter(
          (m) => (m.role === "admin" || m.role === "ai") && m.state !== "read",
        )
        .map((m) => m._id);

      if (unreadAdminMsgIds.length === 0) return;

      const room = `support_${currentUserId}`;
      socket.emit("messages-read", {
        chatId: room,
        messageIds: unreadAdminMsgIds,
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
  }, [messages, socket, currentUserId]);

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
          } catch (_) {}
        });
      };
    },
    [expandedMessages],
  );

  const supportName = lang === "ar" ? "دعم استأجر" : "Estajer Support";

  const getUserAvatar = ({ id }) => {
    if (id === currentUserId) return userAvatar;
    return SUPPORT_AVATAR;
  };

  const getUserName = ({ id }) => {
    if (id === currentUserId) return trans("chat.you") || "أنت";
    return supportName;
  };

  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const resized = await resizeImage(file, {
        maxWidth: 1200,
        quality: 0.85,
      });
      setSelectedImage({ preview: resized.preview, file });
    } catch (_) {
      toast.error(ToastMessage("Failed to process image"));
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) await processImageFile(file);
    e.target.value = "";
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await processImageFile(file);
          break;
        }
      }
    }
  };



  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || isTyping || isSending) return;
    setIsSending(true);

    const imageToSend = selectedImage?.preview || null;
    const sentText = newMessage;

    const userMsgId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: userMsgId,
      sender: { _id: currentUserId, fullName: userFullName },
      content: sentText,
      imageUrl: imageToSend,
      timestamp: new Date().toISOString(),
      state: "sent",
      role: "user",
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setSelectedImage(null);

    const startTime = Date.now();
    let seenTimer = null;
    let typingTimer = null;

    // Simulated seen & typing ONLY IF aiMode is active
    if (aiMode) {
      const seenDelay = Math.floor(Math.random() * 800) + 700;
      seenTimer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m._id === userMsgId ? { ...m, state: "read" } : m)),
        );

        const afterSeenDelay = Math.floor(Math.random() * 500) + 500;
        typingTimer = setTimeout(() => {
          setIsTyping(true);
        }, afterSeenDelay);
      }, seenDelay);
    }

    try {
      const res = await fetch("/api/support?client=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sentText || "",
          image: imageToSend || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      const targetMsgId = data.userMessage?._id || userMsgId;
      const returnedImageUrl = data.userMessage?.imageUrl || imageToSend;

      if (socket) {
        const room = `support_${currentUserId}`;
        socket.emit("stop-typing", { chatId: room, userId: currentUserId });
        socket.emit("send-message", {
          roomId: room,
          message: data.userMessage || {
            _id: targetMsgId,
            role: "user",
            content: sentText,
            imageUrl: returnedImageUrl,
            timestamp: new Date().toISOString(),
            state: "sent",
          },
        });
      }

      // Update the temp message _id and imageUrl but preserve its current state
      // (state will be set to "read" by the seenTimer, not here)
      setMessages((prev) =>
        prev.map((m) =>
          m === tempMessage || m._id === userMsgId
            ? {
                ...m,
                _id: targetMsgId,
                imageUrl: returnedImageUrl,
                // Only force state if NOT aiMode — in aiMode the timer handles it
                ...(data.aiMode ? {} : { state: "sent" }),
              }
            : m,
        ),
      );

      if (data.aiMode && data.aiMessage) {
        const elapsedTime = Date.now() - startTime;
        // The humanized sequence: seen at 700-1500ms, typing at +500-1000ms after seen
        // Minimum total time before showing AI reply: seenDelay + afterSeenDelay + some "reading" time
        // We want typing to be visible for at least ~800ms before the AI reply appears
        const minTotalDelay = 1500 + 500 + 800; // seen + afterSeen + min typing display
        const remainingDelay = Math.max(0, minTotalDelay - elapsedTime);

        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }

        // Ensure seen was already applied (timer may or may not have fired)
        if (seenTimer) clearTimeout(seenTimer);
        if (typingTimer) clearTimeout(typingTimer);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === targetMsgId || m._id === userMsgId
              ? { ...m, state: "read" }
              : m,
          ),
        );
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

        setIsTyping(false);

        const aiMsg = {
          _id: data.aiMessage._id,
          sender: { _id: SUPPORT_ID, fullName: SUPPORT_NAME },
          content: data.aiMessage.content,
          timestamp: data.aiMessage.timestamp,
          state: "sent",
          role: "ai",
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (data.aiMode === false) {
        if (seenTimer) clearTimeout(seenTimer);
        if (typingTimer) clearTimeout(typingTimer);
        setIsTyping(false);
        setAiMode(false);
      }
    } catch (err) {
      if (seenTimer) clearTimeout(seenTimer);
      if (typingTimer) clearTimeout(typingTimer);
      setIsTyping(false);
      toast.error(ToastMessage(err.message || "Failed to send message"), {
        toastId: "support-send-error",
      });
      setMessages((prev) => prev.filter((m) => m._id !== userMsgId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="md:relative absolute h-full w-full bg-white flex flex-col flex-1 z-overlay">
      <ChatHeader
        small={false}
        otherUserAvatar={SUPPORT_AVATAR}
        otherUserOnline={true}
        otherUserName={supportName}
        supportMode={true}
        lastSeen={null}
        formatLastSeen={() => ""}
        t={trans}
        onClose={onClose}
        aiAssistant={false}
        hasActiveOrder={false}
        contactInfo={null}
      />

      {/* aiMode status banner */}
      {!aiMode && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-100 text-xs text-orange-800">
          <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
          {lang === "ar"
            ? "سيرد عليك فريق الدعم قريباً"
            : "Support team will reply soon"}
        </div>
      )}

      <div className="flex flex-col flex-1 relative overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          aiAssistant={false}
          supportMode={true}
          messagesEndRef={messagesEndRef}
          t={trans}
          translate={translate}
          lang={lang}
          visitorName={null}
          getUserAvatar={getUserAvatar}
          getUserName={getUserName}
          createOverflowRef={createOverflowRef}
          expandedMessages={expandedMessages}
          setExpandedMessages={setExpandedMessages}
          isTyping={isTyping}
          small={false}
          textareaRef={textareaRef}
        />

        {/* Input area */}
        <div className="p-4 bg-white border-t border-gray-100 mt-auto">
          {/* Image preview */}
          {selectedImage && (
            <div className="mb-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 text-start">
            <Textarea
              minRows={1}
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPaste={handlePaste}
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                trans("chat.typeMessage") ||
                (lang === "ar" ? "اكتب رسالتك..." : "Type your message...")
              }
              classNames={{
                inputWrapper:
                  "bg-[#f4f4f5] hover:bg-[#e4e4e7] focus-within:!bg-white transition-all duration-200 border md:border-gray-100 border-gray-200 focus-within:border-primary/20",
              }}
            />
            <div className="flex items-center gap-1 shrink-0">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-transparent p-2 h-10 px-2 min-w-0 shadow-none transition-all duration-200 text-gray-400 hover:text-primary hover:scale-110"
                title={lang === "ar" ? "إرفاق صورة" : "Attach image"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              {/* Send button */}
              <Button
                onClick={sendMessage}
                className="bg-transparent font-semibold rounded-full p-2 h-10 px-3 me-1 min-w-0 gap-1 shadow-none transition-transform duration-200 hover:scale-105"
                disabled={
                  (!newMessage.trim() && !selectedImage) ||
                  isTyping ||
                  isSending
                }
              >
                <span
                  className={`${
                    newMessage.trim() || selectedImage
                      ? "text-primary"
                      : "text-gray-300"
                  } hidden md:inline text-sm md:text-base`}
                >
                  {trans("chat.send") || (lang === "ar" ? "إرسال" : "Send")}
                </span>
                <div className="transform -rotate-45">
                  <Send
                    className="h-5 w-5"
                    color={
                      !newMessage.trim() && !selectedImage
                        ? "#d1d5db"
                        : "#f48a42"
                    }
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
