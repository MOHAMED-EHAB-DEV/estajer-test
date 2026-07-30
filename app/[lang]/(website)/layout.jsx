import AiChatContainer from "@/components/chat/AiChatContainer";
import InteractionGTM from "@/components/seo/InteractionGTM";
import GTMPageView from "@/hooks/GTMPageView";
import { Suspense } from "react";
import RevertImpersonation from "@/components/admin/RevertImpersonation";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export async function generateStaticParams() {
  return ["ar", "en"].map((page) => ({ lang: page }));
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;

  return (
    <>
      <Suspense fallback={null}>
        <GTMPageView />
      </Suspense>
      {children}
      <AiChatContainer lang={lang} />
      <RevertImpersonation lang={lang} />
      <InteractionGTM gtmId="GTM-W7PNC244" />
    </>
  );
}
