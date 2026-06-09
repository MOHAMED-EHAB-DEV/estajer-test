import TopSection from "@/components/addProduct/TopSection";
import AddRequestForm from "@/components/addRequest/AddRequestForm";
import { getTranslations } from "@/hooks/getTranslations";

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);

  return (
    <div className="bg-[#F6F6F6] py-2">
      <TopSection
        lang={lang}
        title={translate("request.title")}
        description={translate("request.description")}
      />
      <AddRequestForm lang={lang} translate={translate()} />
    </div>
  );
}
