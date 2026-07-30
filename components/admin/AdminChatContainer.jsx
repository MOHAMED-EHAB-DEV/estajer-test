"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminChatsList from "./AdminChatsList";
import AdminMainChatBox from "./AdminMainChatBox";

function ChatContainerContent({
  chats,
  translate,
  aiAssistant = false,
  supportMode = false,
  initialSelectedChat = null,
}) {
  const searchParams = useSearchParams();
  const targetUserId = searchParams ? searchParams.get("userId") : null;

  const [selectedChat, setSelectedChat] = useState(initialSelectedChat);

  useEffect(() => {
    if (targetUserId && chats && chats.length > 0) {
      const match = chats.find(
        (c) =>
          c.userId?._id?.toString() === targetUserId ||
          c.userId?.toString() === targetUserId ||
          c._id?.toString() === targetUserId
      );
      if (match) {
        setSelectedChat(match);
      }
    }
  }, [targetUserId, chats]);

  return (
    <div className="flex h-full relative">
      <div className="md:w-96 w-full bg-white overflow-hidden border-e-surfaceBlue border-e">
        <AdminChatsList
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          chats={chats}
          translate={translate}
          aiAssistant={aiAssistant}
          supportMode={supportMode}
        />
      </div>
      {selectedChat && (
        <AdminMainChatBox
          key={selectedChat._id}
          selectedChat={selectedChat}
          onClose={() => setSelectedChat(null)}
          translate={translate}
          aiAssistant={aiAssistant}
          supportMode={supportMode}
        />
      )}
    </div>
  );
}

export default function AdminChatContainer(props) {
  return (
    <Suspense fallback={<div className="h-full bg-white animate-pulse" />}>
      <ChatContainerContent {...props} />
    </Suspense>
  );
}
