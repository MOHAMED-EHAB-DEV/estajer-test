import ChangePasswordForm from "@/components/form/ChangePassword";
import RegisterPromotion from "@/components/form/RegisterPromotion";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "تغيير كلمة المرور | استأجر",
      description: "غيّر كلمة المرور الخاصة بحسابك في استأجر لضمان أمان حسابك.",
    },
    en: {
      title: "Change Password | Estajer",
      description:
        "Change your Estajer account password to ensure your account security.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}change-password`,
      languages: {
        ar: `/change-password`,
        en: `/en/change-password`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}change-password`,
      type: "website",
    },
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="relative bg-[#F48A42]">
      <div className="bg-white lg:rounded-s-[2rem] absolute top-0 end-0 lg:w-1/2 w-full h-full"></div>
      <div className="max-w-screen-3xl mx-auto flex flex-col gap-4 text-white">
        <div className="flex flex-wrap">
          <RegisterPromotion lang={lang} />
          <div className="px-6 lg:w-1/2 w-full relative text-black flex justify-center items-center min-h-dvh">
            <ChangePasswordForm lang={lang} translate={translate()} />
          </div>
        </div>
      </div>
    </div>
  );
}
