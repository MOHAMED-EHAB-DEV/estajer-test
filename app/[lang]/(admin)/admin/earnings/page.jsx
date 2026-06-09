import TitleWithSegments from "@/components/shared/TitleWithSegments";
import EarningsContainer from "@/components/admin/earnings/EarningsContainer";
import { getTranslations } from "@/hooks/getTranslations";

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";
  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-8">
      <TitleWithSegments
        title={translate("titles.earnings")}
        translate={translate()}
      />

      <EarningsContainer
        lang={lang}
        translate={translate()}
        langPrefix={langPrefix}
      />
    </div>
  );
};

export default page;
