import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { format, isToday, isYesterday } from "date-fns";
import { ar } from "date-fns/locale";
import { cookies } from "next/headers";

const getChatsData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/chat/list?limit=5`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch chats");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
};

const LatestMessages = async ({ translate, placeholder }) => {
  const trans = useTranslations(translate);
  const chats = placeholder ? [] : await getChatsData();
  const t = (text) => trans(`admin.home.latestMessages.${text}`);

  // Helper function to format message date
  const formatMessageDate = (date) => {
    if (isToday(new Date(date))) {
      return `اليوم | ${format(new Date(date), "h:mm a", { locale: ar })}`;
    }
    if (isYesterday(new Date(date))) {
      return `امس | ${format(new Date(date), "h:mm a", { locale: ar })}`;
    }
    return format(new Date(date), "MM/dd | h:mm a", { locale: ar });
  };

  // Helper function to get default avatar
  const getDefaultAvatar = () =>
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp";

  // Process chat data to match the component's expected format
  const processedChats = chats.map((chat) => {
    const participants = chat.participants || [];
    const lastMessage =
      chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;

    return {
      names: participants.map((p) => p.userId?.fullName || "مستخدم غير معروف"),
      message: lastMessage?.content || "لا توجد رسائل",
      date: lastMessage ? formatMessageDate(lastMessage.timestamp) : "",
      images: participants.map((p) => p.userId?.avatar || getDefaultAvatar()),
      isRead: lastMessage?.state === "read" || false,
    };
  });
  return (
    <div className="p-4 md:p-8 bg-white rounded-[10px] gap-4 md:gap-6 flex flex-col justify-between">
      <h1 className="font-IBMPlex font-semibold text-sm md:text-lg text-darkNavy pb-4 md:pb-6 border-b border-b-black/10 w-full">
        {t("title")}
      </h1>

      <div className="flex flex-col items-center justify-center">
        {processedChats.length > 0 ? (
          processedChats.map(
            ({ images, names, message, date, isRead }, idx) => (
              <div
                className={`flex justify-between px-2 relative md:gap-2 gap-1 py-2 border-b w-full border-b-black/10 ${
                  isRead ? "opacity-60" : ""
                }`}
                key={idx}
              >
                <div className="flex items-center justify-center min-w-16 md:min-w-28">
                  <Image
                    src={anyImgUrl({
                      src: images[0] || getDefaultAvatar(),
                      size: 100,
                    })}
                    alt={names[0] || "مستخدم"}
                    width={45}
                    height={45}
                    unoptimized
                    className="border-2 md:border-4 z-10 rounded-full border-white w-[40px] h-[40px] md:w-[60px] md:h-[60px]"
                  />
                  {images[1] && (
                    <Image
                      src={anyImgUrl({ src: images[1], size: 100 })}
                      alt={names[1] || "مستخدم"}
                      width={35}
                      height={35}
                      unoptimized
                      className="rounded-full translate-x-4 w-[30px] h-[30px] md:w-[50px] md:h-[50px]"
                    />
                  )}
                </div>
                <div className="flex flex-1 justify-between -ms-2">
                  <div className="flex flex-col gap-2">
                    <div className="text-xs md:text-sm font-semibold line-clamp-1">
                      {names.map((v, idx, arr) => (
                        <span key={idx}>
                          {idx !== arr.length - 1 ? `${v} و ` : v}
                        </span>
                      ))}
                    </div>
                    <p className="font-NotoSansArabic text-[11px] md:text-sm text-[#5B5656] line-clamp-2 break-all">
                      {message}
                    </p>
                  </div>
                  <p className="min-w-max font-NotoSansArabic text-[10px] md:text-xs text-[#5B5656]">
                    {date}
                  </p>
                </div>
                <div
                  className={`w-1 h-full ${
                    isRead ? "bg-[#B3B3B3]" : "bg-primary"
                  } absolute left-0 top-0`}
                />
              </div>
            ),
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t("noMessages")}</p>
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <Link
          href="/admin/messages"
          className="text-xs md:text-sm font-semibold text-darkNavy flex items-center gap-1"
        >
          {t("viewAll")}
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
      </div>
    </div>
  );
};
export default LatestMessages;
