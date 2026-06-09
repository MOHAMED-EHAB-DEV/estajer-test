import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import BlogContainer from "@/components/blog/BlogContainer";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Blogs } from "@/components/ui/svgs/Admin";

const getBlogPosts = async (page = 1, limit = 100, lang) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog?page=${page}&limit=${limit}&lang=${lang}&showAll=true&accountType=admin`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: ["everyBlog"],
        },
      }
    );
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("getBlogPosts error:", err);
    return { success: false, data: [] };
  }
};

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langSuffix = lang === "en" ? "En" : "Ar";
  const initialData = await getBlogPosts(1, 100, langSuffix);
  return (
    <div className="flex flex-col gap-14 px-1 md:px-4 pt-8">
      <div className="flex justify-between items-center bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
            <Blogs className="w-8 h-8" color="white" />
          </div>
          <TitleWithSegments
            title={translate("titles.adminBlog")}
            translate={translate()}
            titleClassNames="md:text-3xl text-xl"
          />
        </div>

        <Button
          as={Link}
          href={`/admin/blogs/add`}
          className="md:text-xl text-sm py-8 px-6 flex item-center gap-2"
        >
          اضافة مدونة +
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BlogContainer
          translate={translate()}
          isAdmin={true}
          lang={lang}
          langSuffix={langSuffix}
          initialData={initialData}
          loadingText={translate("blog.loading")}
          emptyText={translate("blog.empty")}
        />
      </div>
    </div>
  );
};
export default Page;
