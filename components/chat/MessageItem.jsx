"use client";
import Image from "next/image";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { anyImgUrl } from "@/utils/ImageUrl";
import { isArabic, linkify } from "@/lib/utils";
import { Seen } from "../ui/svgs/icons/SeenSvg";
import { Trash } from "../ui/svgs/icons/TrashSvg";
import MessageHandler from "./MessageHandler";

export default function MessageItem({
  msg,
  i,
  currentUserId,
  aiAssistant,
  t,
  translate,
  lang,
  visitorName,
  getUserAvatar,
  getUserName,
  createOverflowRef,
  expandedMessages,
  setExpandedMessages,
  showDate,
  currentDate,
  isAdminChat,
  handleDeleteClick,
  firstMessageSenderId,
}) {
  const sender = msg.sender?._id === currentUserId;
  const isAdmin = msg.isAdmin;
  const isAssistant = aiAssistant && msg.sender?._id === "assistant";

  const isReverse = isAdminChat
    ? aiAssistant
      ? isAssistant
      : isAdmin || msg.sender?._id !== firstMessageSenderId
    : isAdmin || !sender;

  const isSenderInAdmin = msg.sender?._id !== firstMessageSenderId;

  const bubbleClasses = isAdminChat
    ? aiAssistant
      ? isAssistant
        ? "bg-white rounded-tl-none text-end"
        : "bg-[#FFECC8] rounded-tr-none text-start"
      : isAdmin
        ? "bg-[#FFECC8] rounded-tr-none text-end"
        : `bg-white rounded-tl-none ${isSenderInAdmin ? "text-end" : "text-start"}`
    : isAdmin
      ? "bg-white rounded-tl-none text-end"
      : sender
        ? "bg-[#FFECC8] rounded-tr-none text-start"
        : "bg-white rounded-tl-none text-end";

  return (
    <div key={i}>
      {showDate && (
        <div className="flex justify-center mb-4">
          <span className="bg-white text-darkNavy text-sm py-1 px-4 rounded shadow-sm">
            {currentDate === format(new Date(), "yyyy/MM/dd")
              ? t("chat.today")
              : currentDate}
          </span>
        </div>
      )}
      <div
        data-message-id={msg._id}
        className={`group message-item flex flex-wrap items-start gap-3 mb-4 transition-all duration-500 ease-in-out ${
          isReverse ? "flex-row-reverse" : ""
        } ${msg.isVanishing ? "opacity-0 scale-90 blur-md -translate-y-4" : "opacity-100 scale-100"}`}
      >
        <div className="relative shrink-0">
          <Image
            src={anyImgUrl({
              src: getUserAvatar({ id: msg.sender?._id, isAdmin, msg }),
              size: 100,
            })}
            alt="avatar"
            unoptimized
            width={45}
            height={45}
            className={`${aiAssistant && isAssistant ? "" : "rounded-full"} ${
              isAdminChat && aiAssistant && isAssistant
                ? "object-contain p-1"
                : isAdmin
                  ? "object-contain p-1 bg-white/80 shadow-sm border border-white/50"
                  : "object-cover shadow-sm border border-white/50"
            }  h-[45px] w-[45px] min-w-[45px]`}
          />
        </div>
        <div
          className={`flex flex-col max-w-[80%] ${
            isReverse ? "items-end" : ""
          }`}
        >
          <div
            className={`flex gap-2 items-center mb-1 ${
              isReverse ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className={`font-semibold text-sm md:text-base ${
                isAdminChat
                  ? aiAssistant
                    ? isAssistant
                      ? "text-[#05113a]"
                      : "text-primary"
                    : isAdmin
                      ? "text-red-600"
                      : "text-primary"
                  : isAdmin
                    ? "text-red-600"
                    : sender
                      ? "text-primary"
                      : aiAssistant
                        ? "text-[#05113a]"
                        : "text-black"
              }`}
            >
              {getUserName({ id: msg.sender?._id, isAdmin, msg })}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              {format(new Date(msg.timestamp), "h:mm a", {
                locale: ar,
              })}
            </span>
            {!aiAssistant && isAdminChat && (
              <button
                onClick={() => handleDeleteClick(msg)}
                className="px-1 text-red-500 hover:bg-red-50 rounded hidden group-hover:block transition-all"
                title={t("admin.messages.deleteTitle")}
              >
                <Trash size={14} />
              </button>
            )}
          </div>
          <div>
            {msg.content && (
              <div
                className={`inline-block py-2.5 px-4 rounded-2xl text-[#333] whitespace-pre-line text-sm md:text-base shadow-sm transition-all duration-200 ${bubbleClasses}`}
              >
                <div className="relative">
                  <span
                    className={
                      expandedMessages.has(msg._id) ? "" : "line-clamp-6"
                    }
                    ref={createOverflowRef(msg._id)}
                  >
                    {linkify(msg.content)}
                  </span>
                  {!expandedMessages.has(msg._id) && (
                    <div className="has-more-btn hidden [.has-more+&]:block text-end mt-2">
                      <button
                        onClick={() =>
                          setExpandedMessages(
                            (prev) => new Set([...prev, msg._id]),
                          )
                        }
                        className="text-primary hover:underline text-[11px] font-bold"
                      >
                        {t("chat.showMore")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {msg?.aiData && msg?.aiData.type !== "text" && (
            <div className="flex flex-col items-center my-1 animate-in fade-in slide-in-from-bottom-2">
              <MessageHandler
                data={msg?.aiData}
                translate={translate}
                lang={lang}
                visitorName={visitorName}
                open={msg?.open !== undefined ? msg.open : true}
              />
            </div>
          )}
          {(isAdminChat ? !aiAssistant : sender && !isAdmin) && (
            <div className={`mt-1 flex ${isAdminChat ? "" : "justify-end"}`}>
              {msg.state === "loading" && <Seen single={true} />}
              {msg.state === "sent" && <Seen />}
              {msg.state === "read" && <Seen color="#F48A42" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
