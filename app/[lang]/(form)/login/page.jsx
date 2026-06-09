import LoginForm from "@/components/form/loginForm";
import RegisterPromotion from "@/components/form/RegisterPromotion";
import React from "react";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "تسجيل الدخول | استأجر",
      description:
        "سجل الدخول إلى حسابك في استأجر للبدء في استكشاف وتأجير المنتجات.",
    },
    en: {
      title: "Login | Estajer",
      description:
        "Login to your Estajer account to start exploring and renting products.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}login`,
      languages: {
        ar: `/login`,
        en: `/en/login`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}login`,
      type: "website",
    },
  };
}

export default async function page({ params, searchParams }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const { message, page } = await searchParams;

  return (
    <div className="relative bg-[#F48A42]">
      <div className="bg-white lg:rounded-s-[2rem] absolute top-0 end-0 lg:w-1/2 w-full h-full"></div>
      <div className="max-w-screen-3xl mx-auto flex flex-col gap-4 text-white">
        <div className="flex flex-wrap">
          <RegisterPromotion lang={lang} />
          <div className="px-6 lg:w-1/2 w-full relative text-black flex justify-center items-center min-h-dvh">
            <LoginForm
              lang={lang}
              queryMessage={message}
              queryPage={page}
              translate={translate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
