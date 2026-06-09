import McpUploadImagesClient from "@/components/form/McpUploadImagesClient";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title:
      lang === "ar"
        ? "رفع صور المنتج | استأجر"
        : "Upload Product Images | Estajer",
    robots: { index: false },
  };
}

export default async function McpUploadImagesPage({ params, searchParams }) {
  const { lang } = await params;
  const { auth_code, code } = await searchParams;
  const activeCode = auth_code || code || "";
  const translate = await getTranslations(lang);

  return (
    <McpUploadImagesClient
      authCode={activeCode}
      lang={lang}
      translate={translate()}
    />
  );
}
