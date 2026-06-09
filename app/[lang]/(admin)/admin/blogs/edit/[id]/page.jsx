import AddBlog from "@/components/AddBlog/AddBlog";
import { getTranslations } from "@/hooks/getTranslations";

const getBlog = async (id) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog/${id}?fields=all`
    );
    const data = await response.json();

    return data.data || {};
  } catch (err) {
    console.log(err);
    return {};
  }
};

const Page = async ({ params }) => {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const blog = await getBlog(id);
  return (
    <div className="flex flex-col gap-6 px-1 md:px-4 pt-8 bg-white">
      <h1 className="text-darkNavy text-3xl font-IBMPlex font-bold">
        تعديل مدونة
      </h1>
      <AddBlog
        lang={lang}
        translate={translate()}
        isEditing={true}
        blog={blog}
      />
    </div>
  );
};
export default Page;
