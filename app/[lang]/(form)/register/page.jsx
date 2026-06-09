import RegisterPromotion from "@/components/form/RegisterPromotion";
import RegisterForm from "@/components/form/RegisterForm";
import React from "react";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "تسجيل جديد | استأجر",
      description:
        "أنشئ حساباً جديداً في استأجر وابدأ رحلتك في تأجير واستئجار المنتجات بسهولة.",
    },
    en: {
      title: "Register | Estajer",
      description:
        "Create a new account on Estajer and start your journey of renting and leasing products easily.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}register`,
      languages: {
        ar: `/register`,
        en: `/en/register`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}register`,
      type: "website",
    },
  };
}

export default async function page({ params, searchParams }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const { page } = await searchParams;

  return (
    <div className="relative bg-[#F48A42]">
      <div className="bg-white lg:rounded-s-[2rem] absolute top-0 end-0 lg:w-1/2 w-full h-full"></div>
      <div className="max-w-screen-3xl mx-auto flex flex-col gap-4 text-white">
        <div className="flex flex-wrap">
          <RegisterPromotion register={true} lang={lang} />
          <div className="px-6 lg:w-1/2 w-full relative text-black flex justify-center items-center min-h-dvh">
            <RegisterForm
              lang={lang}
              translate={translate()}
              queryPage={page}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
