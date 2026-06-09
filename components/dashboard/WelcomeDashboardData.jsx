import WelcomeUser from "@/components/shared/WelcomeUser";
import { cookies } from "next/headers";

const getNotificationsCount = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications?notSeen=true`,
      { headers: { Authorization: token }, cache: "no-store" }
    );
    const data = await res.json();
    return data.success ? data.count : 0;
  } catch (error) {
    console.error("Failed to fetch notifications count from server:", error);
    return 0;
  }
};

export default async function WelcomeDashboardData({ translate, langPrefix }) {
  const notificationsCount = await getNotificationsCount();

  return (
    <WelcomeUser
      translate={translate}
      langPrefix={langPrefix}
      notificationsCount={notificationsCount}
    />
  );
}
