import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { authHeaders } from "@/middleware/authHeaders";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

// Helper function to get date range for a specific month and year
function getMonthDateRange(month, year) {
  const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
  const endDate = new Date(year, month, 0); // Last day of the month
  endDate.setHours(23, 59, 59, 999); // Set to end of day
  return { startDate, endDate };
}

// Helper function to format date for chart labels
function formatDateForChart(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

// Helper function to group orders by days for a specific month
function groupOrdersByDays(orders, month, year) {
  const { startDate, endDate } = getMonthDateRange(month, year);
  const daysInMonth = endDate.getDate();
  const dailyData = [];

  // Create daily periods for the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    const dayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });

    const income = dayOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const withdrawals = dayOrders.reduce(
      (sum, order) => sum + ((order.tax || 0) + (order.ownerAmount || 0)),
      0
    );

    dailyData.push({
      date: formatDateForChart(dayStart),
      income: Math.round(income),
      withdrawals: Math.round(withdrawals),
    });
  }

  return dailyData;
}

export async function GET(req) {
  try {
    await connectDB();

    // Get client parameter to determine authentication method
    const { searchParams } = new URL(req.url);
    const client = searchParams.get("client");

    // Use appropriate authentication method
    const user = client ? await authenticateUser() : await authHeaders(req);

    // Check if user is admin
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get month and year from query parameters, default to current month/year
    const currentDate = new Date();
    const month = parseInt(
      searchParams.get("month") || (currentDate.getMonth() + 1).toString()
    );
    const year = parseInt(
      searchParams.get("year") || currentDate.getFullYear().toString()
    );

    // Get date range for the specified month
    const { startDate, endDate } = getMonthDateRange(month, year);

    // Fetch user statistics in parallel
    const [orders, companyUsers, personalUsers, bannedUsers] =
      await Promise.all([
        Order.find({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["completed", "received"] },
        }).lean(),
        User.countDocuments({ accountType: "company" }),
        User.countDocuments({ accountType: "personal" }),
        User.countDocuments({ isBanned: true }),
      ]);

    // Calculate chart data
    const chartData = groupOrdersByDays(orders, month, year);

    // Calculate totals
    const totalIncome = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const totalWithdrawals = orders.reduce(
      (sum, order) => sum + ((order.tax || 0) + (order.ownerAmount || 0)),
      0
    );
    const netProfit = totalIncome - totalWithdrawals;

    // Prepare pie chart data
    const pieData = [
      { name: "المستخدمين", value: personalUsers },
      { name: "شركات", value: companyUsers },
      { name: "تم حظرهم", value: bannedUsers },
    ];

    const analyticsData = {
      chartData,
      pieData,
      totals: {
        income: Math.round(totalIncome),
        withdrawals: Math.round(totalWithdrawals),
        netProfit: Math.round(netProfit),
      },
      selectedMonth: month,
      selectedYear: year,
    };

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/analytics",
      method: "GET",
      req,
    });
  }
}
