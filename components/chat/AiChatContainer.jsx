import LazyAiChat from "@/components/chat/LazyAiChat";
import { getTranslations } from "@/hooks/getTranslations";

export default async function AiChatContainer({ lang }) {
  const translate = await getTranslations(lang);
  return <LazyAiChat translate={translate()} lang={lang} />;
}
