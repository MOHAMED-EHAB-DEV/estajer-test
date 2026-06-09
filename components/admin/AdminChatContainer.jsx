"use client";
import { useState } from "react";
import AdminChatsList from "./AdminChatsList";
import AdminMainChatBox from "./AdminMainChatBox";

export default function AdminChatContainer({
  chats,
  translate,
  aiAssistant = false,
}) {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-full relative">
      <div className="md:w-96 w-full bg-white overflow-hidden border-e-[#EAEEF3] border-e">
        <AdminChatsList
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          chats={chats}
          translate={translate}
          aiAssistant={aiAssistant}
        />
      </div>
      {selectedChat && (
        <AdminMainChatBox
          key={selectedChat._id}
          selectedChat={selectedChat}
          onClose={() => setSelectedChat(null)}
          translate={translate}
          aiAssistant={aiAssistant}
        />
      )}
    </div>
  );
}
