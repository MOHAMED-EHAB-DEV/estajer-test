import { getTranslations } from "@/hooks/getTranslations";
import SearchAnalyticsContainer from "@/components/admin/search-analytics/SearchAnalyticsContainer";

export const metadata = {
  title: "Search Analytics | Admin",
};

const page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="flex flex-col gap-5 px-1 md:px-4 pt-4">
      <SearchAnalyticsContainer lang={lang} translate={translate()} />
    </div>
  );
};

export default page;
