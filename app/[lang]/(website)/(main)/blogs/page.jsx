import TitleWithSegments from "@/components/shared/TitleWithSegments";
import { getTranslations } from "@/hooks/getTranslations";
import BlogContainer from "@/components/blog/BlogContainer";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const title = translate("titles.blogs");
  const description =
    lang === "ar"
      ? "اقرأ أحدث المقالات والنصائح حول تأجير المنتجات في السعودية. مدونة استأجر توفر لك معلومات قيمة ونصائح مفيدة."
      : "Read the latest articles and tips about product rental in Saudi Arabia. Estajer blog provides valuable information and useful tips.";

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}blogs`,
      languages: {
        ar: `/blogs`,
        en: `/en/blogs`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}blogs`,
      type: "website",
    },
  };
}

const getBlogPosts = async (
  page = 1,
  limit = 15,
  lang,
  category = "latestNews",
  skip = 0
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog?page=${page}&limit=${limit}&lang=${lang}&category=${category}&skip=${skip}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: ["everyBlog"],
        },
      },
    );
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("getBlogPosts error:", err);
    return { success: false, data: [] };
  }
};

const Page = async ({ params, searchParams }) => {
  const { lang } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams?.page) || 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  const translate = await getTranslations(lang);
  const langSuffix = lang === "en" ? "En" : "Ar";
  const initialData = await getBlogPosts(page, limit, langSuffix, "latestNews", skip);
  return (
    <div className="py-16 flex flex-col gap-8 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <TitleWithSegments
        title={translate("titles.blogs")}
        translate={translate()}
        titleClassNames="lg:text-[2.8rem] md:text-[2.6rem] text-[2rem] text-[#F48A42]"
        isMain={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-14 ">
        <BlogContainer
          translate={translate()}
          lang={lang}
          langSuffix={langSuffix}
          initialData={initialData}
          loadingText={translate("blog.loading")}
          emptyText={translate("blog.empty")}
          category="latestNews"
        />
      </div>
    </div>
  );
};
export default Page;
