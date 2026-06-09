import AddBlog from "@/components/AddBlog/AddBlog";
import { getTranslations } from "@/hooks/getTranslations";

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return (
    <div className="flex flex-col gap-6 px-1 md:px-4 pt-8 bg-white">
      <h1 className="text-darkNavy text-3xl font-IBMPlex font-bold">
        اضافة مدونة
      </h1>
      <AddBlog lang={lang} translate={translate()} isEditing={false} />
    </div>
  );
};
export default Page;
