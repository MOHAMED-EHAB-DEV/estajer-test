"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { anyImgUrl } from "@/utils/ImageUrl";
import { toast } from "@/utils/toast";
import ImagePreviewModal from "@/components/admin/ImagePreviewModal";
import { useTranslations } from "@/hooks/useTranslations";
import { Textarea } from "@heroui/react";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import { resizeImage } from "@/utils/ImageResizer";

const UserTicketDetail = ({ initialTicket, lang, translate }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`dashboard.support.${key}`);
  const router = useRouter();
  const [ticket, setTicket] = useState(initialTicket);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    try {
      const processedFiles = await Promise.all(
        files.map((file) => resizeImage(file)),
      );
      setImages((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error(t("error"));
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    try {
      setLoading(true);

      const attachments = images.map((img) => img.preview);

      const res = await fetch(`/api/tickets/${ticket._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, attachments }),
      });

      const data = await res.json();

      if (data.success) {
        setContent("");
        setImages([]);
        router.refresh();
        const getRes = await fetch(`/api/tickets/${ticket._id}`);
        const getTicketData = await getRes.json();
        if (getTicketData.success) {
          setTicket(getTicketData.data);
        }
      } else {
        toast.error(data.error || t("error"));
      }
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === "ar";
  const userAvatar = ticket.user?.avatar;

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    inprogress: "bg-orange-100 text-orange-700",
    solved: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div
      className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ minHeight: "600px", height: "calc(100vh - 120px)" }}
    >
      {/* Header Info */}
      <div className="bg-white border-b border-gray-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-IBMPlex text-darkNavy">
              {ticket.title}
            </h1>
            <div
              className={`px-3 py-1 rounded-full font-bold text-xs ${statusColors[ticket.status] || "bg-gray-100 text-gray-700"}`}
            >
              {t(`status.${ticket.status}`)}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <p>
              {t("ticket.refId")}:{" "}
              <span className="font-semibold text-gray-700">{ticket._id}</span>
            </p>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <p>
              {t("ticket.subject")}:{" "}
              <span className="font-semibold text-gray-700">
                {trans(`ticket.subjectOptions.${ticket.subject}`)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#FDF5EE]/30 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-darken bg-[url('/estajer/images/https%3A%2F%2Fres.cloudinary.com%2Fdhfzkadm2%2Fimage%2Fupload%2Fv1743810725%2Fsocial-networks-dating-apps-vector-seamless-pattern_341076-469_hxu7zh.webp?w=600&q=50')]"></div>

        <div className="relative z-10 flex flex-col gap-6">
          {ticket.messages?.map((msg, index) => {
            const isSystemMessage = msg.isAdmin;
            const msgAvatar =
              msg.sender?.avatar || (isSystemMessage ? null : userAvatar);
            const msgName = isSystemMessage
              ? t("chat.teamName")
              : msg.sender?.fullName || ticket.name;

            return (
              <div
                key={index}
                className={`flex max-w-[80%] ${isSystemMessage ? (isRtl ? "mr-auto" : "ml-auto") : isRtl ? "ml-auto" : "mr-auto"}`}
              >
                <div
                  className={`flex gap-3 ${isSystemMessage ? (isRtl ? "flex-row-reverse" : "flex-row") : "flex-row"}`}
                >
                  {!isSystemMessage && (
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden self-end mb-2 flex items-center justify-center">
                      {msgAvatar ? (
                        <Image
                          src={anyImgUrl({ src: msgAvatar })}
                          alt=""
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-gray-400">
                          {msgName?.charAt(0)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-xs text-gray-500 ${isSystemMessage ? (isRtl ? "text-left" : "text-right") : "text-right"}`}
                    >
                      {msgName} •{" "}
                      {new Date(msg.timestamp).toLocaleDateString(
                        isRtl ? "ar-EG" : "en-US",
                        { hour: "numeric", minute: "numeric" },
                      )}
                    </span>

                    <div
                      className={`p-4 rounded-2xl ${isSystemMessage ? "bg-primary text-white rounded-br-none" : "bg-white border border-gray-200 rounded-bl-none"} whitespace-pre-wrap`}
                    >
                      {msg.content}
                    </div>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-2 mt-2 ${isSystemMessage ? (isRtl ? "justify-end" : "justify-start") : "justify-start"}`}
                      >
                        {msg.attachments.map((img, i) => (
                          <div
                            onClick={() => setImagePreview(img)}
                            key={i}
                            className="block cursor-pointer w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                          >
                            <Image
                              src={anyImgUrl({ src: img })}
                              alt="attachment"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover hover:scale-110 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="shrink-0">
        {/* Reply Box */}
        {ticket.status !== "cancelled" && ticket.status !== "solved" && (
          <form
            onSubmit={sendMessage}
            className="bg-white border-t border-gray-100 p-4"
          >
            {images.length > 0 && (
              <div className="flex gap-4 mb-4 overflow-x-auto py-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 shrink-0"
                  >
                    <Image
                      src={img.preview}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-1">
              <label className="cursor-pointer hover:text-primary transition-colors p-2 shrink-0 text-gray-400 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                  />
                </svg>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </label>

              <Textarea
                minRows={1}
                maxRows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (content.trim() || images.length > 0) sendMessage(e);
                  }
                }}
                placeholder={t("chat.placeholder")}
                className="flex-1"
              />

              <button
                type="submit"
                onClick={sendMessage}
                disabled={loading || (!content.trim() && images.length === 0)}
                className="bg-transparent font-semibold rounded-full p-2 h-10 px-4 me-1 mb-1 min-w-0 flex items-center justify-center gap-1 shadow-none transition-transform duration-200 hover:scale-105 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <span
                      className={`${
                        content.trim() || images.length > 0
                          ? "text-primary"
                          : "text-gray-300"
                      } hidden md:inline`}
                    >
                      {t("chat.send")}
                    </span>
                    <div className="transform -rotate-45 rtl:rotate-135">
                      <Send
                        size={22}
                        color={
                          !(content.trim() || images.length > 0)
                            ? "#d1d5db"
                            : "#f48a42"
                        }
                      />
                    </div>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        {(ticket.status === "cancelled" || ticket.status === "solved") && (
          <div className="bg-gray-100 text-center font-semibold text-gray-500 p-4 border-t border-gray-200 shrink-0">
            {t("chat.closed")}
          </div>
        )}
      </div>
      <ImagePreviewModal
        previewImage={imagePreview}
        onClose={() => setImagePreview(null)}
      />
    </div>
  );
};

export default UserTicketDetail;
