import Link from "next/link";
import {
  Arrow,
  Cart,
  Completed,
  Pending,
  Canceled,
  Requests,
  Messages,
} from "../ui/svgs/CardsSvg";
import { cookies } from "next/headers";

const getOrdersStats = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders-status`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch orders stats");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders stats:", error);
    return {};
  }
};

const getUnreadMessagesCount = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chat/unread`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch unread messages count");
    const data = await response.json();
    return data.unreadMessages?.length ?? 0;
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return 0;
  }
};

export default async function Cards({ placeholder, translate, langPrefix }) {
  const t = (text) => translate(`dashboard.home.cards.${text}`);
  const ordersStats = placeholder ? {} : await getOrdersStats();
  const unreadMessagesCount = placeholder ? 0 : await getUnreadMessagesCount();
  const cards = [
    {
      title: t("rentalRequests"),
      count: ordersStats?.sent ?? 0,
      Icon: Cart,
      className: "text-[#9747FF]",
      href: "my-orders",
    },
    {
      title: t("completedOrders"),
      count: ordersStats?.completed ?? 0,
      Icon: Completed,
      className: "text-[#4FD64F]",
      href: "my-orders",
    },
    {
      title: t("pendingOrders"),
      count: ordersStats?.pending ?? 0,
      Icon: Pending,
      className: "text-[#F48A42]",
      href: "my-orders",
    },
    {
      title: t("canceledOrders"),
      count: ordersStats?.canceled ?? 0,
      Icon: Canceled,
      className: "text-[#F44242]",
      href: "my-orders",
    },
    {
      title: t("productRequests"),
      count: ordersStats?.requests ?? 0,
      Icon: Requests,
      className: "text-[#17A1FA]",
      href: "#",
    },
    {
      title: t("unreadMessages"),
      count: unreadMessagesCount,
      Icon: Messages,
      className: "text-[#4FD6B6]",
      href: "messages",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:gap-6 gap-2 mb-6">
      {cards.map(({ Icon, className, title, count, href }, idx) => (
        <Link
          href={`/${langPrefix}dashboard/${href}`}
          className={`flex items-center md:gap-4 gap-1.5 justify-between lg:p-6 md:p-5 p-3 bg-white rounded-lg ${
            idx > 3 ? "2xl:col-span-2" : ""
          }`}
          key={idx}
        >
          <div className="flex items-center md:gap-4 gap-2">
            <Icon className="md:w-14 md:h-14 w-10 h-10" />
            <div className="font-IBMPlex text-[0.85rem] md:text-[1.2rem] 2xl:text-[1.25rem] leading-tight">
              <div className={className}>{title}</div>
              <div className="font-semibold">{placeholder ? "..." : count}</div>
            </div>
          </div>
          <div>
            <Arrow className="md:w-5 md:h-5 w-3 h-3" />
          </div>
        </Link>
      ))}
    </div>
  );
}
