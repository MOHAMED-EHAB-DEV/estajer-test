"use client";
import { useState } from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { isArabic, removeLastWord } from "@/lib/utils";
import { X } from "../ui/svgs/icons/XSvg";
import { UserCard } from "../ui/svgs/icons/UserCardSvg";

export default function ChatHeader({
  small,
  otherUserAvatar,
  otherUserOnline,
  otherUserName,
  lastSeen,
  formatLastSeen,
  t,
  onClose,
  aiAssistant,
  isAdminChat,
  participant1,
  participant2,
  hasActiveOrder,
  contactInfo,
}) {
  const [showContact, setShowContact] = useState(false);
  const ASSISTANT_AVATAR =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1763326241/abc0121a-15f7-40ba-adf3-07b2e2eba8d1_ev61fp.webp";

  return (
    <div
      className={`${
        small ? "bg-darkNavy/95 p-4" : "bg-white p-6"
      } flex justify-between items-center rounded-t-lg ${
        isAdminChat ? "border-b border-b-[#EAEEF3]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {isAdminChat ? (
          <div className="flex items-center">
            <Image
              src={anyImgUrl({
                src:
                  participant1?.avatar ||
                  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
                size: 100,
              })}
              alt="avatar"
              unoptimized
              width={40}
              height={40}
              className="rounded-full border-2 border-white z-10 object-cover"
            />
            <Image
              src={anyImgUrl({
                src: aiAssistant
                  ? ASSISTANT_AVATAR
                  : participant2?.avatar ||
                    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
                size: 100,
              })}
              alt="avatar"
              unoptimized
              width={35}
              height={35}
              className="rounded-full border-2 border-white translate-x-3 object-cover"
            />
          </div>
        ) : (
          <div className="relative">
            <Image
              src={anyImgUrl({
                src:
                  otherUserAvatar ||
                  "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
                size: 100,
              })}
              alt="avatar"
              unoptimized
              width={45}
              height={45}
              className="rounded-full border-2 bg-white h-10 w-10 md:h-[45px] md:w-[45px] object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                otherUserOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
        )}
        <div className="flex flex-col">
          <div
            className={`${
              small ? "text-white" : "text-[#0D092B]"
            } flex items-center gap-2 text-sm md:text-base`}
          >
            {isAdminChat ? (
              <h3 className="flex flex-col text-sm font-bold">
                <span>{participant1?.fullName}</span>
                <span>
                  {aiAssistant ? "Estajer Assistant" : participant2?.fullName}
                </span>
              </h3>
            ) : (
              <h3
                dir={isArabic(otherUserName) ? "rtl" : "ltr"}
                className="font-bold"
              >
                {aiAssistant ? otherUserName : removeLastWord(otherUserName)}
              </h3>
            )}
          </div>
          {!isAdminChat && (
            <span
              className={`text-xs md:text-sm ${small ? "text-[#ddd]" : "text-[#5B5656]"}`}
            >
              {otherUserOnline
                ? t("chat.online")
                : lastSeen &&
                  `${t("chat.lastSeen")} ${formatLastSeen(lastSeen)}`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {hasActiveOrder && contactInfo && (
          <div className="relative">
            <button
              onClick={() => setShowContact(!showContact)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
              title="Contact Info"
            >
              <UserCard
                className={`${small ? "text-white" : "text-[#0D092B]"} w-[22px] h-[22px] md:w-[24px] md:h-[24px]`}
                fill={small ? "#ffffff" : "#0D092B"}
                width={24}
                height={24}
              />
            </button>
            {showContact && (
              <div className="absolute end-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 text-[#0D092B] animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-bold mb-2 border-b border-gray-100 pb-2">
                  {t("chat.contactInfo")}
                </div>
                {contactInfo.phone && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-gray-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{contactInfo.phone}</span>
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden text-ellipsis">
                    <svg
                      className="w-4 h-4 text-gray-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{contactInfo.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <button
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          onClick={onClose}
        >
          <X
            size={16}
            className={`${small ? "text-white" : "text-[#0D092B]"} w-[18px] h-[18px] md:w-5 md:h-5`}
          />
        </button>
      </div>
    </div>
  );
}
