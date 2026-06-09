import { cookies } from "next/headers";
import LatestActivities from "./LatestActivities";

const getAdminNotifications = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notifications?limit=5`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch notifications");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return [];
  }
};

export default async function AdminNotificationsContainer({
  placeholder,
  translate,
  title,
}) {
  const notifications = placeholder ? [] : await getAdminNotifications();

  return (
    <LatestActivities 
      translate={translate} 
      notifications={notifications}
      title={title}
    />
  );
}