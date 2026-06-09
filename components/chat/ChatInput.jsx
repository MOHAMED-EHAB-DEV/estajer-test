"use client";
import Image from "next/image";
import { Textarea } from "@heroui/input";
import Button from "../ui/Button";
import { X } from "../ui/svgs/icons/XSvg";
import { ProductsIcon } from "../ui/svgs/icons/ProductsIconSvg";
import { Send } from "../ui/svgs/icons/SendSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function ChatInput({
  small,
  selectedProductForSend,
  setSelectedProductForSend,
  newMessage,
  setNewMessage,
  sendMessage,
  textareaRef,
  showProductSearch,
  setShowProductSearch,
  t,
  isAdminChat,
  placeholder,
}) {
  return (
    <div
      className={`${
        small ? "p-3" : "p-4"
      } bg-white border-t border-gray-100 mt-auto`}
    >
      {selectedProductForSend && (
        <div className="mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300 mx-1">
          <div className="flex items-center gap-3 pe-3 py-2 ps-2 rounded-2xl relative overflow-hidden border ">
            {/* Accent bar */}
            <div className="absolute start-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full" />
            {/* Image */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm border border-gray-100 ring-2 ring-primary/10 ms-1">
              <Image
                fill
                unoptimized
                src={anyImgUrl({
                  src: selectedProductForSend.images?.[0]?.preview,
                  size: 120,
                })}
                alt={selectedProductForSend.name}
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {t("chat.sharing")}
                </span>
              </div>
              <div className="text-xs font-bold text-darkNavy truncate leading-tight">
                {selectedProductForSend.name}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="text-xs font-extrabold text-primary">
                  {selectedProductForSend.rental?.value}
                </div>
                <Currency className="w-3 h-3" color="#f48a42" />
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setSelectedProductForSend(null)}
              className="shrink-0 w-7 h-7 bg-white text-gray-400 transition-opacity duration-200 opacity-100  hover:opacity-50 z-10"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-end gap-1 text-start">
        <Textarea
          minRows={1}
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={placeholder || t("chat.typeMessage")}
          classNames={{
            inputWrapper:
              "bg-[#f4f4f5] hover:bg-[#e4e4e7] focus-within:!bg-white transition-all duration-200 border md:border-gray-100 border-gray-200 focus-within:border-primary/20",
          }}
        />
        <div className="flex items-center gap-1 shrink-0">
          {!isAdminChat && (
            <Button
              onClick={() => setShowProductSearch((prev) => !prev)}
              className={`bg-transparent p-2 h-10 px-3 min-w-0 shadow-none transition-all duration-200 ${
                showProductSearch
                  ? "text-primary scale-110"
                  : "text-gray-400 hover:text-primary hover:scale-110"
              }`}
              title={t("chat.sendProduct")}
            >
              <ProductsIcon width={small ? 24 : 26} height={small ? 14 : 16} />
            </Button>
          )}
          <Button
            onClick={sendMessage}
            className="bg-transparent font-semibold rounded-full p-2 h-10 px-4 me-1 min-w-0 gap-1 shadow-none transition-transform duration-200 hover:scale-105"
            disabled={!newMessage.trim() && !selectedProductForSend}
          >
            {!small && (
              <span
                className={`${
                  newMessage.trim() || selectedProductForSend
                    ? "text-primary"
                    : "text-gray-300"
                } hidden md:inline text-sm md:text-base`}
              >
                {t("chat.send")}
              </span>
            )}
            <div className="transform -rotate-45">
              <Send
                className={small ? "h-6 w-6" : "h-5 w-5"}
                color={
                  !newMessage.trim() && !selectedProductForSend
                    ? "#d1d5db"
                    : "#f48a42"
                }
              />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
