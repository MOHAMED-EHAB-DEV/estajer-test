import VisitsAnalyticsContainer from "@/components/admin/visits/VisitsAnalyticsContainer";
import { getTranslations } from "@/hooks/getTranslations";

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-4">
      <VisitsAnalyticsContainer lang={lang} translate={translate()} />
    </div>
  );
};

export default page;
