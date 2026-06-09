import WelcomeUser from "@/components/shared/WelcomeUser";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Chat from "@/models/Chat";
import VisitorCount from "@/models/VisitorCount";

const getDateRange = (startDateParam, endDateParam) => {
  const now = new Date();
  let startDate, endDate;

  if (startDateParam && endDateParam) {
    startDate = new Date(startDateParam);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }

  return { startDate, endDate };
};

const getTodaysOrdersCount = async (startDateParam, endDateParam) => {
  try {
    await connectDB();
    const { startDate, endDate } = getDateRange(startDateParam, endDateParam);
    const count = await Order.countDocuments({
      status: { $ne: "not-paid" },
      createdAt: { $gte: startDate, $lt: endDate },
    });

    return count;
  } catch (error) {
    console.error("Error fetching orders count:", error);
    return 0;
  }
};

const getUnreadMessagesCount = async (startDateParam, endDateParam) => {
  try {
    await connectDB();
    const { startDate, endDate } = getDateRange(startDateParam, endDateParam);

    const result = await Chat.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.state": "sent",
          "messages.timestamp": { $gte: startDate, $lt: endDate },
        },
      },
      { $count: "unreadCount" },
    ]);

    const unreadCount = result.length > 0 ? result[0].unreadCount : 0;
    return unreadCount;
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return 0;
  }
};

const getTodaysVisitorCount = async (startDateParam, endDateParam) => {
  try {
    await connectDB();
    const { startDate, endDate } = getDateRange(startDateParam, endDateParam);
    const isDefaultDay = !startDateParam && !endDateParam;

    if (isDefaultDay) {
      const todayCount = await VisitorCount.findOne({ date: startDate });
      return todayCount ? todayCount.count : 0;
    } else {
      const result = await VisitorCount.aggregate([
        { $match: { date: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, totalCount: { $sum: "$count" } } },
      ]);

      return result.length > 0 ? result[0].totalCount : 0;
    }
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    return 0;
  }
};

export default async function WelcomeUserData({
  translate,
  langPrefix,
  queryParams,
}) {
  const startDate = queryParams?.startDate;
  const endDate = queryParams?.endDate;

  const [todaysOrdersCount, unreadMessagesCount, todaysVisitorCount] =
    await Promise.all([
      getTodaysOrdersCount(startDate, endDate),
      getUnreadMessagesCount(startDate, endDate),
      getTodaysVisitorCount(startDate, endDate),
    ]);

  return (
    <WelcomeUser
      isAdminPage={true}
      translate={translate}
      langPrefix={langPrefix}
      OrderCount={todaysOrdersCount}
      newChatsCount={unreadMessagesCount}
      viewsCount={todaysVisitorCount}
      queryParams={queryParams}
    />
  );
}
