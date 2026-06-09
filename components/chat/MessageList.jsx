"use client";
import { format } from "date-fns";
import { Alert } from "@heroui/react";
import MessageItem from "./MessageItem";

export default function MessageList({
  messages,
  currentUserId,
  aiAssistant,
  messagesEndRef,
  t,
  translate,
  lang,
  visitorName,
  getUserAvatar,
  getUserName,
  createOverflowRef,
  expandedMessages,
  setExpandedMessages,
  isTyping,
  small,
  textareaRef,
  isAdminChat,
  handleDeleteClick,
}) {
  const firstMessageSenderId = messages?.[0]?.sender?._id;

  return (
    <div className="overflow-y-auto bg-[#EAEEF3] relative h-full">
      <div className="absolute bottom-0 right-0 w-full h-full mix-blend-darken opacity-15 bg-[url('/estajer/images/https%3A%2F%2Fres.cloudinary.com%2Fdhfzkadm2%2Fimage%2Fupload%2Fv1743810725%2Fsocial-networks-dating-apps-vector-seamless-pattern_341076-469_hxu7zh.webp?w=600&q=50')]"></div>
      <div
        className={`h-full overflow-y-auto px-4 relative pt-8 ${
          !small ? "pb-4" : ""
        }`}
        onClick={() => {
          const s = window.getSelection?.();
          if ((s && s.toString().length) || (s && s.anchorNode !== "text"))
            return;
          textareaRef.current?.focus();
        }}
      >
        {!aiAssistant && messages.length === 0 && (
          <Alert
            variant="warning"
            className="text-sm mb-4 !bg-red-200/50 text-red-900 border-none shadow-sm"
          >
            {t("chat.warning")}
          </Alert>
        )}
        {messages?.map((msg, i) => {
          const formatMessageDate = (timestamp) => {
            return format(new Date(timestamp), "yyyy/MM/dd");
          };
          const currentDate = formatMessageDate(msg.timestamp);
          const previousDate =
            i > 0 ? formatMessageDate(messages[i - 1].timestamp) : null;
          const showDate = currentDate !== previousDate;

          return (
            <MessageItem
              key={msg._id || i}
              msg={msg}
              i={i}
              currentUserId={currentUserId}
              aiAssistant={aiAssistant}
              t={t}
              translate={translate}
              lang={lang}
              visitorName={visitorName}
              getUserAvatar={getUserAvatar}
              getUserName={getUserName}
              createOverflowRef={createOverflowRef}
              expandedMessages={expandedMessages}
              setExpandedMessages={setExpandedMessages}
              showDate={showDate}
              currentDate={currentDate}
              isAdminChat={isAdminChat}
              handleDeleteClick={handleDeleteClick}
              firstMessageSenderId={firstMessageSenderId}
            />
          );
        })}
        {isTyping && (
          <div className="text-xs text-gray-500 italic text-end mb-4 animate-pulse px-2">
            {t("chat.typing")}
          </div>
        )}
        <div ref={messagesEndRef} className="h-px" />
      </div>
      {!small && (
        <div className="absolute top-0 right-0 w-full h-28 bg-gradient-to-b from-[rgba(255,255,255,0.5)] to-transparent pointer-events-none"></div>
      )}
    </div>
  );
}
