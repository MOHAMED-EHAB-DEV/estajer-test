import AdminChatContainer from "@/components/admin/AdminChatContainer";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const getChatsData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/chat/list`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch chats");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
};

export default async function AdminMessagesPage({ params }) {
  const { lang } = await params;
  const chatsData = await getChatsData();
  const translate = await getTranslations(lang);

  return (
    <div className="md:h-[calc(100vh-106px)] h-[calc(100vh-105px)] bg-white rounded-lg shadow-sm">
      <div className="h-full">
        <AdminChatContainer translate={translate()} chats={chatsData} />
      </div>
    </div>
  );
}
