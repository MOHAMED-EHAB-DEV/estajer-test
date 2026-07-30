import ForgotPasswordForm from "@/components/form/ForgotPassword";
import RegisterPromotion from "@/components/form/RegisterPromotion";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "نسيت كلمة المرور | استأجر",
      description:
        "استعد كلمة المرور الخاصة بحسابك في استأجر لتتمكن من تسجيل الدخول.",
    },
    en: {
      title: "Forgot Password | Estajer",
      description: "Recover your Estajer account password to log in.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    metadataBase: new URL(siteURL),
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}forgot-password`,
      languages: {
        ar: `/forgot-password`,
        en: `/en/forgot-password`,
      },
    },
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="relative bg-primary">
      <div className="bg-white lg:rounded-s-[2rem] absolute top-0 end-0 lg:w-1/2 w-full h-full"></div>
      <div className="max-w-screen-3xl mx-auto flex flex-col gap-4 text-white">
        <div className="flex flex-wrap">
          <RegisterPromotion lang={lang} />
          <div className="px-6 lg:w-1/2 w-full relative text-black flex justify-center items-center min-h-dvh">
            <ForgotPasswordForm lang={lang} translate={translate()} />
          </div>
        </div>
      </div>
    </div>
  );
}
