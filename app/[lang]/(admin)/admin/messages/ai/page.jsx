import AdminChatContainer from "@/components/admin/AdminChatContainer";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const getChatsData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/aichat/list`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch chats");
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

export default async function AdminAiMessagesPage({ params }) {
  const { lang } = await params;
  const chatsData = await getChatsData();
  const translate = await getTranslations(lang);

  return (
    <div className="h-[90vh] bg-white rounded-lg shadow-sm">
      <div className="h-full">
        <AdminChatContainer
          translate={translate()}
          chats={chatsData}
          aiAssistant={true}
        />
      </div>
    </div>
  );
}
