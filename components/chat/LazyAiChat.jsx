"use client";
import dynamic from "next/dynamic";

const AiChat = dynamic(() => import("./AiChat"), { ssr: false });

export default function LazyAiChat({ translate, lang }) {
  return <AiChat translate={translate} lang={lang} />;
}
