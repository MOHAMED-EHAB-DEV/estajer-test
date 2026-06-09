import { cookies } from "next/headers";
import NotificationsBox from "../shared/NotificationsBox";

const getNotifications = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications?limit=5`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export default async function NotificationsContainer({
  placeholder,
  translate,
  lang,
}) {
  const t = (text) => translate(`notifications.${text}`);
  const notifications = placeholder ? [] : await getNotifications();

  return (
    <NotificationsBox
      placeholder={placeholder}
      notifications={notifications}
      lang={lang}
      t={t}
    />
  );
}
