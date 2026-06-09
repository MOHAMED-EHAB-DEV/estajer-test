import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { anyImgUrl } from "@/utils/ImageUrl";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const BgStatus = {
  solved: "bg-success",
  new: "bg-primary",
  inprogress: "bg-[#F48A42]",
  cancelled: "bg-[#F55757]",
};

const getLatestTickets = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets?limit=4`, {
      headers: { Authorization: token },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch latest tickets");
    const data = await res.json();
    return data?.success ? data.data.tickets : [];
  } catch (error) {
    console.error("Error fetching latest tickets:", error);
    return [];
  }
};

const LatestSupportTickets = async ({ lang }) => {
  const translate = await getTranslations(lang);
  const t = (text) => translate(`admin.home.latestSupportTickets.${text}`);
  
  const latestTickets = await getLatestTickets();

  return (
    <div className="p-8 bg-white rounded-[10px] gap-6 flex flex-col justify-between">
      <h1 className="font-IBMPlex font-semibold text-lg text-darkNavy pb-6 border-b border-b-black/10 w-full">
        {t("title")}
      </h1>

      <div className="flex flex-col items-center justify-center">
        {latestTickets.length === 0 ? (
          <div className="text-gray-500 py-4 font-semibold text-sm">
            لا توجد تذاكر حاليا
          </div>
        ) : (
          latestTickets.map((ticket, idx) => {
            const lastMessage = ticket.messages?.length > 0 ? ticket.messages[ticket.messages.length - 1] : null;
            const description = lastMessage?.content || "لا توجد رسائل";
            const latestComment = `اخر تعليق: ${lastMessage?.sender?.fullName || ticket.name}`;
            const date = new Date(ticket.lastMessageAt || ticket.createdAt).toLocaleDateString(
              lang === "en" ? "en-US" : "ar-EG",
              { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
            );
            const userAvatar = ticket.user?.avatar || lastMessage?.sender?.avatar;

            // In backend, isRead doesn't exactly exist as a boolean on ticket yet, assume unread if status is new or inprogress
            const isRead = ticket.status === "solved" || ticket.status === "cancelled";

            return (
              <Link
                href={`/${lang}/admin/support/tickets/${ticket._id}`}
                className={`flex justify-between gap-4 py-3 hover:bg-gray-50 transition-colors pl-2 border-b w-full border-b-black/10 relative`}
                key={ticket._id || idx}
              >
                <div className="flex gap-4">
                  <div className="w-[55px] h-[55px] rounded-full self-center relative bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {userAvatar ? (
                      <Image
                        src={anyImgUrl({
                          src: userAvatar,
                          size: 100,
                        })}
                        alt={ticket.title}
                        unoptimized
                        width={60}
                        height={60}
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-400">
                        {ticket.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold line-clamp-1">{ticket.title}</h3>
                    <p className="font-NotoSansArabic text-xs text-[#5B5656] line-clamp-1">
                      {description}
                    </p>
                    <div className="flex gap-2 justify-between flex-wrap">
                      <h6 className="font-NotoSansArabic font-bold text-xs text-[#5B5656]">
                        {latestComment}
                      </h6>
                      <p className="font-NotoSansArabic text-xs text-[#5B5656]">
                        {date}
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 min-w-[88px] h-fit rounded-sm py-1 self-center flex items-center justify-center ${BgStatus[ticket.status] || "bg-gray-500"} font-IBMPlex font-semibold text-xs text-white`}
                >
                  {t(ticket.status) || ticket.status}
                </span>
                <div
                  className={`w-1 h-full ${
                    isRead ? "bg-[#B3B3B3]" : "bg-primary"
                  } absolute left-0 top-0`}
                />
              </Link>
            );
          })
        )}
      </div>
      <div className="flex justify-center mt-2">
        <Link
          href={`/${lang}/admin/support/tickets`}
          className="text-sm font-semibold text-darkNavy flex items-center gap-1 hover:text-primary transition-colors"
        >
          {t("viewAll")}
          <ChevronLeft />
        </Link>
      </div>
    </div>
  );
};
export default LatestSupportTickets;
