import ChatContainer from "@/components/chat/ChatContainer";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import PushNotificationModal from "@/components/shared/PushNotificationModal";

const getData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const headers = { Authorization: token };

    const [chatsRes, supportRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chat/list?page=1&limit=20`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/support`, { headers }),
    ]);

    const chats = chatsRes.ok ? await chatsRes.json() : [];
    const supportChat = supportRes.ok ? await supportRes.json() : null;

    return { chats: Array.isArray(chats) ? chats : [], supportChat };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { chats: [], supportChat: null };
  }
};

export default async function ChatsPage({ params }) {
  const { lang } = await params;
  const { chats, supportChat } = await getData();
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
        <ChatContainer
          translate={translate()}
          chats={chats}
          supportChat={supportChat}
          lang={lang}
        />
      </div>
    </div>
  );
}

