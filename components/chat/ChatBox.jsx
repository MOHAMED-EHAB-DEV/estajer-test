"use client";
import { useEffect, useState, useRef } from "react";
import Button from "../ui/Button";
import { format, formatDistanceToNow } from "date-fns";
import { useUser } from "@/context/UserContext";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";

export default function ChatBox({
  currentUserId,
  userFullName,
  otherUserId,
  onClose,
  selectedChat,
}) {
  const { socket } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(Date.now());
  const [unreadMessages, setUnreadMessages] = useState([]);
  const messageTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const initChat = async () => {
      const participants = [currentUserId, otherUserId].sort();
      const generatedChatId = participants.join("_");
      setChatId(generatedChatId);

      socket.emit("join-room", generatedChatId);

      try {
        const chatRes = await fetch(`/api/chat?chatId=${generatedChatId}`);
        if (!chatRes.ok) {
          if (chatRes.status !== 404) {
            console.error("Error loading messages:", await chatRes.text());
          }
          return;
        }
        const chatData = await chatRes.json();
        setMessages(chatData.messages || []);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    initChat();

    socket.on(
      "new-message",
      ({ message }) =>
        message?.sender._id !== currentUserId &&
        setMessages((prev) => [...prev, message]),
    );

    return () => {
      if (chatId) socket.emit("leave-chat", chatId);
      socket.off("new-message");
    };
  }, [socket, currentUserId, otherUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || newMessage.length > 500) return;

    // Rate limiting - 2 seconds between messages
    const now = Date.now();
    if (now - lastMessageTime < 2000) {
      toast.warning(ToastMessage("Please wait before sending another message"));
      return;
    }

    setLastMessageTime(now);

    // Add message locally with loading state
    const tempMessage = {
      sender: { _id: currentUserId, fullName: userFullName },
      content: newMessage,
      timestamp: new Date().toISOString(),
      state: "loading",
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          otherUserId,
          message: newMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Update message state to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg === tempMessage ? { ...msg, state: "sent" } : msg,
        ),
      );

      socket.emit("send-message", {
        roomId: chatId,
        message: { ...tempMessage, state: "sent" },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg !== tempMessage));
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messageIds: [messageId],
        }),
      });
      setUnreadMessages((prev) => prev.filter((id) => id !== messageId));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when they become visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          if (messageId && unreadMessages.includes(messageId)) {
            markMessageAsRead(messageId);
          }
        }
      });
    });

    const messageElements = document.querySelectorAll(".message-item");
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      messageElements.forEach((el) => observer.unobserve(el));
    };
  }, [messages, unreadMessages]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !newMessage) return;

    socket.emit("typing", { chatId, userId: currentUserId });

    // Clear previous timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId, userId: currentUserId });
    }, 1000);

    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [newMessage, socket, chatId, currentUserId]);

  // Handle message read status
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const unreadMessageIds = messages
        .filter(
          (msg) => msg.sender._id !== currentUserId && msg.state !== "read",
        )
        .map((msg) => msg._id);

      if (unreadMessageIds.length === 0) return;

      try {
        await fetch("/api/chat", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            messageIds: unreadMessageIds,
          }),
        });

        setMessages((prev) =>
          prev.map((msg) =>
            unreadMessageIds.includes(msg._id)
              ? { ...msg, state: "read" }
              : msg,
          ),
        );

        // Notify other user that messages were read
        socket?.emit("messages-read", {
          chatId,
          messageIds: unreadMessageIds,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    // Mark messages as read when chat is visible
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
  }, [messages, currentUserId, chatId, socket]);

  // Listen for typing and read receipt events
  useEffect(() => {
    if (!socket) return;

    socket.on("user-typing", ({ userId }) => {
      if (userId !== currentUserId) {
        setIsTyping(true);
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
  }, [socket, currentUserId]);

  // Update this effect to handle user status and last seen
  useEffect(() => {
    if (!socket) return;

    socket.on(
      "user-status-changed",
      ({ userId, online, lastSeen: lastSeenTime }) => {
        if (userId === otherUserId) {
          setOtherUserOnline(online);
          setLastSeen(lastSeenTime);
        }
      },
    );

    // Request other user's status
    socket.emit("get-user-status", otherUserId);

    return () => {
      socket.off("user-status-changed");
    };
  }, [socket, otherUserId]);

  // Get other user's name when chat loads
  useEffect(() => {
    if (selectedChat) {
      const otherUser = selectedChat.participants.find(
        (p) => p?.userId?._id === otherUserId,
      );
      setOtherUserName(otherUser?.userId?.fullName || "");
      setOtherUserOnline(otherUser?.userId?.isOnline || false);
      setLastSeen(otherUser?.userId?.lastSeen || null);
    }
  }, [selectedChat, otherUserId]);

  const formatLastSeen = (date) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="fixed bottom-0 right-4 z-50  w-[400px] h-[520px] bg-white shadow-lg rounded-t-lg flex flex-col">
      <div className="p-4 bg-darkNavy text-white flex justify-between items-center rounded-t-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3>{otherUserName}</h3>
            <span
              className={`w-2 h-2 rounded-full ${
                otherUserOnline ? "bg-green-400" : "bg-gray-400"
              }`}
            />
          </div>
          <span className="text-xs text-gray-300">
            {otherUserOnline
              ? "online"
              : lastSeen && `last seen ${formatLastSeen(lastSeen)}`}
          </span>
        </div>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages?.map((msg, i) => (
          <div
            key={i}
            data-message-id={msg._id}
            className={`mb-4 message-item ${
              msg.sender._id === currentUserId ? "text-right" : "text-left"
            }`}
          >
            <div className="group relative">
              <div
                className={`inline-block p-2 rounded-lg ${
                  msg.sender._id === currentUserId
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                {msg.content}
                {msg.sender._id === currentUserId && (
                  <span className="ml-2 text-xs text-gray-500">
                    {msg.state === "loading" && "⋯"}
                    {msg.state === "sent" && "✓"}
                    {msg.state === "read" && "✓✓"}
                  </span>
                )}
              </div>
              <span
                className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 
            hidden group-hover:block bg-black text-white text-xs py-1 px-2 
            rounded whitespace-nowrap"
              >
                {format(new Date(msg.timestamp), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-sm text-gray-500 italic text-end">Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={500}
            className="flex-1 border rounded-lg p-2 disabled:opacity-50"
            placeholder={"Type a message..."}
          />
          <Button onPress={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
