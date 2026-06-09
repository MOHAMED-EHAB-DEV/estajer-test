"use client";
import { useEffect, useState } from "react";
import ChatsList from "./ChatsList";
import MainChatBox from "./MainChatBox";
import { useUser } from "@/context/UserContext";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";

export default function ChatContainer({ chats, translate }) {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();

  useEffect(() => {
    if (selectedChat) onOpen();
  }, [selectedChat, onOpen]);

  useEffect(() => {
    if (!isOpen) setSelectedChat(null);
  }, [isOpen]);

  return (
    <div className="flex h-full relative">
      <div className="md:w-80 w-full bg-white overflow-hidden border-e-[#EAEEF3] border-e">
        <ChatsList
          currentUserId={user?._id}
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          chats={chats}
          translate={translate}
        />
      </div>
      {selectedChat && isOpen && (
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
      )}
    </div>
  );
}
