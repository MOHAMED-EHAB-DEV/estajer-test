import Button from "../ui/Button";
import { Cloud4 } from "../ui/svgs/icons/Cloud4Svg";
import { Analytics } from "../ui/svgs/icons/AnalyticsSvg";;
import Blog from "../shared/Blog";
import { getTranslations } from "@/hooks/getTranslations";
import Link from "next/link";

async function getNewestArticles(lang) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog?limit=3&page=1&lang=${lang}`,
      { next: { revalidate: 60 * 60 * 24 * 2 } }
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch newest blogs:", error);
    return [];
  }
}

export default async function Blogs({ lang }) {
  const translate = await getTranslations(lang, ["home"]);
  const t = (value) => translate(`home.blogs.${value}`);
  const langSuffix = lang === "en" ? "En" : "Ar";
  const articles = await getNewestArticles(langSuffix);

  return (
    articles?.length > 0 && (
      <div className="bg-[#FFF9F0] relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-16 py-28 relative z-10 flex flex-col">
          <div className="lg:w-[38%] flex flex-col justify-center lg:mb-0 mb-10">
            <div className="lg:text-[2.8rem] md:text-[2.3rem] text-[1.8rem] font-IBMPlex font-semibold md:mb-10 mb-6 flex gap-6 items-center">
              <Analytics
                className={`lg:w-16 md:w-12 w-9 ${(lang === "en") & "flip-y"}`}
              />
              {t("title")}
            </div>
          </div>
          <div className="w-full self-center grid md:grid-cols-3 grid-cols-1 md:gap-6 gap-4 mb-10">
            {articles.map((article) => (
              <Blog
                blog={article}
                lang={lang}
                translate={translate()}
                key={article._id}
              />
            ))}
          </div>
          <div className="self-center">
            <Button
              as={Link}
              href={`/${lang === "ar" ? "" : "en/"}blogs`}
              className="font-semibold text-[#F9FAFC] font-IBMPlex md:p-7 md:text-lg"
            >
              {translate("ui.button.showAllBlogs")}
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 w-full flex justify-start z-0 opacity-60">
          <div className={`${lang === "en" ? "-scale-x-100" : ""} w-max`}>
            <Cloud4 className="w-[300px] sm:w-[400px] md:w-[500px]" />
          </div>
        </div>
      </div>
    )
  );
}
