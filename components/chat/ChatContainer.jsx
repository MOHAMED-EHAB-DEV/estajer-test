"use client";
import { useEffect, useState, useCallback } from "react";
import ChatsList from "./ChatsList";
import MainChatBox from "./MainChatBox";
import SupportChatBox from "./SupportChatBox";
import { useUser } from "@/context/UserContext";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";

export default function ChatContainer({ chats, translate, supportChat, lang }) {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState(null);
  const [localSupportChat, setLocalSupportChat] = useState(supportChat);
  const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();

  const handleUpdateSupportChat = useCallback((updatedMessages) => {
    setLocalSupportChat((prev) => {
      if (!prev) return { messages: updatedMessages };
      return { ...prev, messages: updatedMessages };
    });
  }, []);

  useEffect(() => {
    setLocalSupportChat(supportChat);
  }, [supportChat]);

  useEffect(() => {
    if (selectedChat) onOpen();
  }, [selectedChat, onOpen]);

  useEffect(() => {
    if (!isOpen) setSelectedChat(null);
  }, [isOpen]);

  return (
    <div className="flex h-full relative">
      <div className="md:w-80 w-full bg-white overflow-hidden border-e-surfaceBlue border-e">
        <ChatsList
          currentUserId={user?._id}
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          chats={chats}
          supportChat={localSupportChat}
          translate={translate}
          lang={lang}
        />
      </div>
      {selectedChat && isOpen && (
        selectedChat._type === "support" ? (
          <SupportChatBox
            key="support"
            currentUserId={user?._id}
            userAvatar={user?.avatar}
            userFullName={user?.fullName}
            onClose={() => onOpenChange(false)}
            translate={translate}
            lang={lang}
            onUpdateSupportChat={handleUpdateSupportChat}
          />
        ) : (
          <MainChatBox
            key={selectedChat._id}
            otherUserId={
              selectedChat.participants.find((p) => p?.userId?._id !== user?._id)
                ?.userId?._id
            }
            currentUserId={user?._id}
            onClose={() => onOpenChange(false)}
            selectedChat={selectedChat}
            userFullName={user?.fullName}
            userAvatar={user?.avatar}
            translate={translate}
          />
        )
      )}
    </div>
  );
}
