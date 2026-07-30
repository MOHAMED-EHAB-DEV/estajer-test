import AdminChatContainer from "@/components/admin/AdminChatContainer";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const getSupportChats = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/support/list?page=1&limit=20`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch support chats");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default async function AdminSupportMessagesPage({ params }) {
  const { lang } = await params;
  const chatsData = await getSupportChats();
  const translate = await getTranslations(lang);

  return (
    <div className="md:h-[calc(100vh-106px)] h-[calc(100vh-105px)] bg-white rounded-lg shadow-sm">
      <div className="h-full">
        <AdminChatContainer
          translate={translate()}
          chats={chatsData}
          supportMode={true}
        />
      </div>
    </div>
  );
}
