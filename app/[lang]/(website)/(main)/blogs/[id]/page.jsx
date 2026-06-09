import React from "react";
import BlogPost from "@/components/blog/singleBlog/Blog";
import { getTranslations } from "@/hooks/getTranslations";
import { anyImgUrl } from "@/utils/ImageUrl";
import Script from "next/script";
import { notFound, permanentRedirect } from "next/navigation";

const getBlogs = async () => {
  try {
    const params = new URLSearchParams({ limit: 100 });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog?${params}`,
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
};

const getBlog = async (id, lang) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog/${id}?fields=titleAr,titleEn,contentAr,contentEn,thumbnail,createdAt,comments,category,seoTitleAr,seoTitleEn,seoDescriptionAr,seoDescriptionEn,urlName,altText,faqs&lang=${lang}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: [`blog-${id}`, "everyBlog"],
        },
      },
    );
    const data = await response.json();

    return data.data || {};
  } catch (err) {
    console.log(err);
    return {};
  }
};

const getLatestBlogPosts = async (lang, category, id) => {
  try {
    const catParam = category ? `&category=${category}` : "";
    const excludeParam = id ? `&exclude=${id}` : "";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog?page=1&limit=3&length=100&lang=${lang}${catParam}${excludeParam}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: ["everyBlog"],
        },
      },
    );
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("getBlogPosts error:", err);
    return { success: false, data: [] };
  }
};

const getRandomBlogs = async (lang, id) => {
  try {
    const excludeParam = id ? `&exclude=${id}` : "";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/blog?limit=3&length=100&lang=${lang}&random=true${excludeParam}`,
      {
        next: {
          revalidate: 60 * 60 * 24 * 2,
          tags: ["everyBlog"],
        },
      },
    );
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("getRandomBlogs error:", err);
    return [];
  }
};

export async function generateStaticParams({ params }) {
  const { lang } = await params;
  const blogs = await getBlogs();
  return blogs.map((blog) => ({ id: blog.urlName, lang }));
}

export async function generateMetadata({ params }) {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const { lang, id } = await params;
  const blogId = id?.includes("_ref_")
    ? decodeURIComponent(id.split("_ref_")[1])
    : id;
  const langSuffix = lang === "en" ? "En" : "Ar";
  const blog = await getBlog(blogId, langSuffix);

  if (!blog || !blog._id) {
    return {
      title: lang === "ar" ? "المقال غير موجود" : "Blog not found",
      description: lang === "ar" ? "المقال غير موجود" : "Blog not found",
      robots: { index: false, follow: false },
    };
  }

  const title =
    (lang === "ar" ? blog.seoTitleAr : blog.seoTitleEn) ||
    `${blog.title} | ${lang === "ar" ? "استأجر" : "Estajer"}`;
  const description =
    (lang === "ar" ? blog.seoDescriptionAr : blog.seoDescriptionEn) ||
    blog.content
      ?.slice(0, 160)
      .replace(/<[^>]+>/g, "")
      .slice(0, 160) ||
    (lang === "ar"
      ? "محتوى المقال غير متاح"
      : "Content of the article is not available");

  const canonical = `${siteURL}/${lang === "ar" ? "" : "en/"}blogs/${
    blog.urlName
  }`;
  const ogLocale = lang === "ar" ? "ar_SA" : "en_US";

  return {
    title,
    description,
    keywords: blog.title?.split(" ").filter((word) => word.length > 2),
    alternates: {
      canonical,
      languages: {
        ar: `${siteURL}/blogs/${blog.urlName}`,
        en: `${siteURL}/en/blogs/${blog.urlName}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Estajer",
      images: [
        {
          url: anyImgUrl({ src: blog.thumbnail?.preview, size: 800 }),
          alt: blog.altText || blog.title,
          width: 800,
          height: 600,
          type: "image/webp",
        },
      ],
      locale: ogLocale,
      type: "article",
      publishedTime: blog.createdAt,
      authors: ["Estajer"],
    },
    publishedTime: blog.createdAt,
    authors: ["Estajer"],
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: anyImgUrl({ src: blog.thumbnail?.preview, size: 800 }),
          alt: blog.title,
          width: 800,
        },
      ],
    },
  };
}

const Page = async ({ params }) => {
  const { lang, id } = await params;

  const translate = await getTranslations(lang);
  const langSuffix = lang === "en" ? "En" : "Ar";
  const [blog, randomBlogs] = await Promise.all([
    getBlog(id, langSuffix),
    getRandomBlogs(langSuffix, id),
  ]);
  if (!blog || !blog._id) {
    return notFound();
  }
  if (blog && blog._id) {
    const decodedRef = decodeURIComponent(id);

    if (blog.urlName && decodedRef !== blog.urlName) {
      permanentRedirect(
        `/${lang === "ar" ? "" : "en/"}blogs/${encodeURIComponent(
          blog.urlName,
        )}`,
      );
    }
  }

  const blogs = await getLatestBlogPosts(langSuffix, blog.category, id);

  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const blogURL = `${siteURL}/${lang === "ar" ? "" : "en/"}blogs/${
    blog.urlName
  }`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: [anyImgUrl({ src: blog.thumbnail?.preview, size: 1200 })],
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: [
      {
        "@type": "Organization",
        name: "Estajer",
        url: siteURL,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Estajer",
      logo: {
        "@type": "ImageObject",
        url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768055959/logo_with_slogan_-estajer_y6tvqg_mujo45.webp",
      },
    },
    description: blog.content?.slice(0, 160).replace(/<[^>]+>/g, ""),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogURL,
    },
  };

  const faqJsonLd =
    blog.faqs && blog.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: blog.faqs.map((faq) => ({
            "@type": "Question",
            name: lang === "ar" ? faq.questionAr : faq.questionEn,
            acceptedAnswer: {
              "@type": "Answer",
              text: lang === "ar" ? faq.answerAr : faq.answerEn,
            },
          })),
        }
      : null;

  return (
    <>
      <Script
        id="blog-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <BlogPost
        lang={lang}
        blog={blog}
        translate={translate()}
        blogs={blogs}
        randomBlogs={randomBlogs}
      />
    </>
  );
};
export default Page;
