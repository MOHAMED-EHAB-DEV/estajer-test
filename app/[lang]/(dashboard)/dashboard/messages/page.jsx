import ChatContainer from "@/components/chat/ChatContainer";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import PushNotificationModal from "@/components/shared/PushNotificationModal";

const getChatsData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chat/list`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export default async function ChatsPage({ params }) {
  const { lang } = await params;
  const chatsData = await getChatsData();
  const translate = await getTranslations(lang);

  return (
    <div className="md:h-[calc(100vh-122px)] h-[calc(100vh-105px)] bg-white rounded-lg shadow-sm">
      <div className="h-full">
        <PushNotificationModal
          translate={translate()}
          open={true}
          customer={true}
          lang={lang}
        />
        <ChatContainer translate={translate()} chats={chatsData} />
      </div>
    </div>
  );
}
