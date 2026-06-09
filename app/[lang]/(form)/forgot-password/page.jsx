import ForgotPasswordForm from "@/components/form/ForgotPassword";
import RegisterPromotion from "@/components/form/RegisterPromotion";
import {getTranslations} from "@/hooks/getTranslations";

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await  getTranslations(lang);

  return (
    <div className="relative bg-[#F48A42]">
      <div className="bg-white lg:rounded-s-[2rem] absolute top-0 end-0 lg:w-1/2 w-full h-full"></div>
      <div className="max-w-screen-3xl mx-auto flex flex-col gap-4 text-white">
        <div className="flex flex-wrap">
          <RegisterPromotion lang={lang} />
          <div className="px-6 lg:w-1/2 w-full relative text-black flex justify-center items-center min-h-dvh">
            <ForgotPasswordForm lang={lang} translate = {translate()} />
          </div>
        </div>
      </div>
    </div>
  );
}
