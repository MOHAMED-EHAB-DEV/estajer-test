import { getTranslations } from "@/hooks/getTranslations";
import BannersContainer from "@/components/admin/banners/BannersContainer";
import { Advertisement } from "@/components/ui/svgs/Admin";
import TitleWithSegments from "@/components/shared/TitleWithSegments";

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="flex flex-col gap-14 px-1 md:px-4 pt-8">
      <div className="flex justify-between items-center bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
            <Advertisement className="w-8 h-8" color="white" />
          </div>
          <TitleWithSegments
            title={lang === "ar" ? "بانرات الصفحة الرئيسية" : "Home Banners"}
            translate={translate()}
            titleClassNames="md:text-3xl text-xl"
          />
        </div>
      </div>

      <BannersContainer translate={translate()} lang={lang} />
    </div>
  );
};
export default Page;
