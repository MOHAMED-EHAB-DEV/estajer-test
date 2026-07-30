import AdminChatContainer from "@/components/admin/AdminChatContainer";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const getChatsData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/aichat/list?page=1&limit=20`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch chats");
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

export default async function AdminAiMessagesPage({ params, searchParams }) {
  const { lang } = await params;
  const sParams = await searchParams;
  let chatsData = await getChatsData();
  const translate = await getTranslations(lang);

  const selectedChatId = sParams?.chatId;
  let passedSelectedChat = null;
  if (selectedChatId && Array.isArray(chatsData)) {
    const selectedIndex = chatsData.findIndex(c => c.sessionId === selectedChatId);
    if (selectedIndex >= 0) {
      const [selectedChat] = chatsData.splice(selectedIndex, 1);
      chatsData.unshift(selectedChat);
      passedSelectedChat = selectedChat;
    }
  }

  return (
    <div className="h-[90vh] bg-white rounded-lg shadow-sm">
      <div className="h-full">
        <AdminChatContainer
          translate={translate()}
          chats={chatsData}
          aiAssistant={true}
          initialSelectedChat={passedSelectedChat}
        />
      </div>
    </div>
  );
}
