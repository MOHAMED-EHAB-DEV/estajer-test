import Link from "next/link";
import {
  Completed,
  Pending,
  Messages,
  Arrow,
  Views,
  DailyIncome,
  TotalIncome,
} from "../ui/svgs/CardsSvg";
import { cookies } from "next/headers";
import { Plus } from "../ui/svgs/icons/PlusSvg";

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

const getOrdersStats = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders-status?role=renter`,
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

const getProductsCount = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/count`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch products count");
    const data = await response.json();
    return data.productsCount || 0;
  } catch (error) {
    console.error("Error fetching products count:", error);
    return 0;
  }
};

const getIncome = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/income`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const { dailyIncome, totalIncome } = await response.json();
    return { dailyIncome, totalIncome };
  } catch (error) {
    console.error("Error fetching income:", error);
    return { dailyIncome: 0, totalIncome: 0 };
  }
};

const getVisitsStats = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/visits`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch visits stats");
    const res = await response.json();
    return res.success ? res.data : { total: 0, today: 0 };
  } catch (error) {
    console.error("Error fetching visits stats:", error);
    return { total: 0, today: 0 };
  }
};

const CircularProgress = ({
  percentage,
  className,
  strokeWidth = 8,
  color,
}) => {
  const radius = 45; // Fixed internal radius for 100x100 viewBox
  const circumference = radius * 2 * Math.PI;
  const dash = (percentage * circumference) / 100;

  return (
    <svg viewBox="0 0 100 100" className={`${className} transform -rotate-90`}>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        stroke="#f0f0f0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dash}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default async function RenterCards({ translate, placeholder, lang }) {
  const t = (key) => translate(`dashboard.renter.${key}`);
  const langPrefix = lang === "ar" ? "" : "en/";
  // Fetch data if not in placeholder mode

  const [
    productsCount,
    ordersStats,
    unreadMessagesCount,
    { dailyIncome, totalIncome },
    visitsStats,
  ] = placeholder
    ? [0, {}, 0, { dailyIncome: 0, totalIncome: 0 }, { total: 0, today: 0 }]
    : await Promise.all([
        getProductsCount(),
        getOrdersStats(),
        getUnreadMessagesCount(),
        getIncome(),
        getVisitsStats(),
      ]);

  const totalOrders =
    (ordersStats?.completed || 0) +
    (ordersStats?.pending || 0) +
    (ordersStats?.canceled || 0);

  const completedPercentage =
    totalOrders > 0
      ? Math.round(((ordersStats?.completed || 0) * 100) / totalOrders)
      : 0;
  const pendingPercentage =
    totalOrders > 0
      ? Math.round(((ordersStats?.pending || 0) * 100) / totalOrders)
      : 0;
  const canceledPercentage =
    totalOrders > 0
      ? Math.round(((ordersStats?.canceled || 0) * 100) / totalOrders)
      : 0;

  const cardsData = [
    {
      title: t("cards.products"),
      count: placeholder ? "..." : productsCount.toString(),
      Icon: ({ className }) => (
        <Completed className={className} color="#F48A42" background="#fce7c5" />
      ),
      className: "text-[#F48A42]",
      addProduct: true,
    },
    {
      title: t("cards.receivedRentals"),
      count: placeholder ? "..." : (ordersStats?.sent || 0).toString(),
      Icon: ({ className }) => (
        <Pending className={className} color="#9747FF" background="#f0e4ff" />
      ),
      className: "text-[#9747FF]",
      progress: [
        {
          title: t("cards.progress.completed"),
          count: placeholder ? "..." : (ordersStats?.completed || 0).toString(),
          percentage: completedPercentage,
          color: "#4FD658",
        },
        {
          title: t("cards.progress.pending"),
          count: placeholder ? "..." : (ordersStats?.pending || 0).toString(),
          percentage: pendingPercentage,
          color: "#F48A42",
        },
        {
          title: t("cards.progress.canceled"),
          count: placeholder ? "..." : (ordersStats?.canceled || 0).toString(),
          percentage: canceledPercentage,
          color: "#F44242",
        },
      ],
    },
    {
      title: t("cards.dailyViews"),
      count: placeholder ? "..." : (visitsStats?.today || 0).toString(),
      Icon: Views,
      className: "text-[#17A1FA]",
    },
    {
      title: t("cards.dailyEarnings"),
      count: placeholder ? "..." : `${dailyIncome} ${t("currency")}`,
      Icon: DailyIncome,
      className: "text-[#4FD64F]",
    },
    {
      title: t("cards.totalBalance"),
      count: placeholder ? "..." : `${totalIncome} ${t("currency")}`,
      Icon: TotalIncome,
      className: "text-[#23983C]",
    },
    {
      title: t("cards.unreadMessages"),
      count: placeholder ? "..." : unreadMessagesCount.toString(),
      Icon: Messages,
      className: "text-[#4FD6B6]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:gap-6 gap-2 mb-6">
      {cardsData.map(
        ({ Icon, className, title, count, progress, addProduct }, idx) => (
          <div
            className={`flex flex-wrap items-center md:gap-4 gap-1 justify-between lg:p-6 md:p-5 p-3 bg-white rounded-lg ${
              idx === 1
                ? "2xl:col-span-3 2xl:-order-none col-span-2 -order-1"
                : ""
            }`}
            key={idx}
          >
            <div className="flex items-center md:gap-4 gap-2">
              <Icon className="md:w-14 md:h-14 w-10 h-10" />
              <div className="font-IBMPlex text-[0.8rem] md:text-[1.2rem] 2xl:text-[1.25rem] leading-tight">
                <div className={className}>{title}</div>
                <div className="font-semibold md:mt-1">
                  {placeholder ? "..." : count}
                </div>
              </div>
            </div>
            {addProduct && (
              <Link
                href={`/${langPrefix}add-product`}
                className="flex items-center gap-1 md:text-base text-sm bg-[#F48A42] ms-auto text-white md:px-4 px-2 py-2 rounded-lg"
              >
                <Plus color="white" className="md:w-4 md:h-4 w-3 h-3" />
                <span className="hidden md:block">{t("cards.addProduct")}</span>
              </Link>
            )}
            {progress && (
              <div className="flex flex-wrap lg:gap-8 gap-4 mt-2 items-center">
                {progress?.map(({ title, count, percentage, color }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center shrink-0">
                      <CircularProgress
                        percentage={placeholder ? 0 : percentage}
                        color={color}
                        className="md:w-14 md:h-14 w-9 h-9"
                      />
                      <span className="absolute md:text-sm text-[0.6rem] font-semibold">
                        {placeholder ? "0" : percentage}%
                      </span>
                    </div>
                    <div>
                      <div
                        className="font-semibold md:text-lg text-sm"
                        style={{ color }}
                      >
                        {placeholder ? "..." : count}
                      </div>
                      <div className="md:text-base text-[0.7rem] line-clamp-1">
                        {title}
                      </div>
                    </div>
                  </div>
                ))}
                {progress && (
                  <Arrow className="md:w-5 md:h-5 w-4 h-4 shrink-0" />
                )}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}
