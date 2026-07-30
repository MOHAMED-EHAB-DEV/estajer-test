import { Suspense } from "react";
import AiChatContainer from "@/components/admin/AiChatContainer";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

const getAiChatsData = async (searchParams) => {
  try {
    const apiParams = new URLSearchParams(searchParams);

    if (!apiParams.has("limit")) apiParams.set("limit", "20");

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/messages/ai?${apiParams}`,
      { headers: { Authorization: token } }
    );
    if (!response.ok) throw new Error("Failed to fetch AI chats");
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AI chats:", error);
    return { chats: [], totalChats: 0, totalPages: 1, currentPage: 1 };
  }
};

const page = async ({ params, searchParams }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const sParams = await searchParams;

  const initialData = await getAiChatsData(sParams);

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        translate={translate()}
        title={lang === "ar" ? "نظرة عامة لمساعد استأجر" : "AI Chat Overview"}
      />

      <AiChatContainer initialData={initialData} translate={translate()} lang={lang} queryParams={sParams} />
    </div>
  );
};

export default page;