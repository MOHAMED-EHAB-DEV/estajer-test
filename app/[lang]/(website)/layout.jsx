import AiChatContainer from "@/components/chat/AiChatContainer";

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
      {children}
      <AiChatContainer lang={lang} />
    </>
  );
}
