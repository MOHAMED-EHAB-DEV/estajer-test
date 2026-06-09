"use client";
import { useTranslations } from "@/hooks/useTranslations";
import TitleWithSegments from "@/components/shared/TitleWithSegments";
import React, { useMemo, useEffect, useState } from "react";
import BlogDetails from "@/components/blog/singleBlog/BlogDetails";
import ShareButtons from "@/components/blog/singleBlog/ShareButtons";
import Comments from "@/components/blog/singleBlog/Comments";
import BlogCard from "./BlogCard";

const BlogPost = ({ translate, lang, blog, blogs, randomBlogs = [] }) => {
  const trans = useTranslations(translate);
  const [activeId, setActiveId] = useState("");
  const date = new Date(blog.createdAt);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const { processedContent, groupedHeadings } = useMemo(() => {
    if (!blog.content) return { processedContent: "", groupedHeadings: [] };

    const flatHeadings = [];
    let count = 0;
    const processed = blog.content.replace(
      /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
      (match, tag, attrs, text) => {
        const cleanText = text.replace(/<[^>]+>/g, "").trim();
        if (!cleanText) return match;

        const id = slugify(cleanText) || `heading-${count++}`;
        flatHeadings.push({ id, text: cleanText, level: tag.toLowerCase() });
        return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
      },
    );

    const grouped = [];
    let currentParent = null;

    flatHeadings.forEach((h) => {
      if (h.level === "h2") {
        currentParent = { ...h, children: [] };
        grouped.push(currentParent);
      } else if (h.level === "h3" && currentParent) {
        currentParent.children.push(h);
      } else if (h.level === "h3" && !currentParent) {
        // H3 before any H2
        grouped.push({ ...h, children: [] });
      }
    });

    return { processedContent: processed, groupedHeadings: grouped };
  }, [blog.content]);

  const [expandedParents, setExpandedParents] = useState({});
  const [isMainContentsOpen, setIsMainContentsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Only run scroll logic on desktop
      if (window.innerWidth < 768) return;

      const allFlatIds = [];
      groupedHeadings.forEach((p) => {
        allFlatIds.push(p.id);
        p.children?.forEach((c) => allFlatIds.push(c.id));
      });

      const headingElements = allFlatIds.map((id) =>
        document.getElementById(id),
      );
      const articleContents = document.getElementById("articleContents");
      const scrollPosition = window.scrollY + 150;
      if (articleContents && articleContents.offsetTop > scrollPosition - 100) {
        setIsMainContentsOpen(false);
      }
      let currentId = "";
      for (const el of headingElements) {
        if (el && el.offsetTop <= scrollPosition) currentId = el.id;
        else break;
      }

      if (currentId) {
        setActiveId(currentId);
        // Find parent and expand it exclusively on scroll
        const parent = groupedHeadings.find(
          (p) =>
            p.id === currentId || p.children?.some((c) => c.id === currentId),
        );
        if (parent) {
          setExpandedParents({ [parent.id]: true });
          // Optional: Open the main section if scroll reaches content
          setIsMainContentsOpen(true);
          if (parent.id === "heading-0") {
            setIsMainContentsOpen(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [groupedHeadings, processedContent]);

  const toggleParent = (id) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formattedDate = date.toLocaleDateString("ar", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 py-16 px-10 max-w-screen-2xl mx-auto">
      <TitleWithSegments
        title={blog.title}
        translate={translate}
        titleClassNames="lg:text-[2rem] md:text-[1.8rem] text-[1.3rem] text-[#F48A42]"
        segments={[
          {
            text: trans("titles.blogs"),
            href: lang === "ar" ? "/blogs" : "/en/blogs",
          },
          {
            text: trans(`blog.categories.${blog.category}`),
            href:
              (lang === "ar" ? "/blogs" : "/en/blogs") +
              (blog.category === "latestNews"
                ? ""
                : `/category/${blog.category}`),
          },
          {
            text: blog.title,
            href: (lang === "ar" ? "/blogs" : "/en/blogs") + `/${blog.urlName}`,
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_35%] gap-12">
        <div className="flex flex-col gap-6">
          <BlogDetails
            image={blog.thumbnail?.preview}
            date={formattedDate}
            content={processedContent}
            category={blog.category}
            trans={trans}
            title={blog.title}
            altText={blog.altText}
            faqs={blog.faqs}
            lang={lang}
          />
          <ShareButtons
            trans={trans}
            blogUrl={`${process.env.NEXT_PUBLIC_APP_URL}/blogs/${blog.urlName}`}
            blogTitle={blog.title}
          />
          <Comments trans={trans} comments={blog.comments} blogId={blog._id} />

          {/* More Blogs Section */}
          {randomBlogs.length > 0 && (
            <div className="flex flex-col gap-6 my-8">
              <h2 className="text-darkNavy font-IBMPlex font-semibold text-2xl">
                {trans("singleBlog.moreBlogs")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {randomBlogs.map((post) => (
                  <BlogCard
                    blog={post}
                    key={post._id}
                    isLatestPosts={true}
                    card={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-8" id="articleContents">
          <div className="flex flex-col gap-4">
            <h2 className="text-darkNavy font-IBMPlex font-semibold text-2xl">
              {trans("singleBlog.latestBlogPosts")}
            </h2>
            {blogs.length === 0 ? (
              <span className="text-center col-span-full text-black/30">
                {trans("singleBlog.noLatestBlogPosts")}
              </span>
            ) : (
              blogs.map((post) => (
                <BlogCard isLatestPosts={true} blog={post} key={post._id} />
              ))
            )}
          </div>

          {groupedHeadings.length > 0 && (
            <div
              className={`${
                isMainContentsOpen ? "md:sticky" : ""
              } top-24 z-20 flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden`}
            >
              <button
                onClick={() => setIsMainContentsOpen(!isMainContentsOpen)}
                className="w-full flex items-center justify-between p-8 text-right hover:bg-gray-50/50 transition-colors"
              >
                <h3 className="text-2xl font-bold text-darkNavy border-r-4 border-[#F48A42] pr-4">
                  {trans("singleBlog.articleContents")}
                </h3>
                <div
                  className={`h-8 w-8 rounded-full bg-[#F48A42]/10 flex items-center justify-center transition-transform duration-300 ${
                    isMainContentsOpen
                      ? "rotate-180 bg-[#F48A42] text-white"
                      : "text-[#F48A42]"
                  }`}
                >
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out ${
                  isMainContentsOpen
                    ? "max-h-[2000px] opacity-100 pb-8 px-8"
                    : "max-h-0 opacity-0"
                }`}
              >
                <nav>
                  <ul className="flex flex-col gap-3">
                    {groupedHeadings.map((parent) => {
                      const isParentActive =
                        activeId === parent.id ||
                        parent.children?.some((c) => c.id === activeId);
                      const isExpanded =
                        expandedParents[parent.id] || isParentActive;

                      return (
                        <li key={parent.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between group">
                            <a
                              href={`#${parent.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(parent.id);
                                if (el) {
                                  window.scrollTo({
                                    top: el.offsetTop - 100,
                                    behavior: "smooth",
                                  });
                                }
                              }}
                              className={`transition-all duration-300 text-lg flex items-center gap-2 flex-1 ${
                                activeId === parent.id
                                  ? "text-[#F48A42] font-bold"
                                  : "text-darkNavy font-semibold hover:text-[#F48A42]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full bg-[#F48A42] transition-opacity ${
                                  activeId === parent.id
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                }`}
                              />
                              {parent.text}
                            </a>
                            {parent.children?.length > 0 && (
                              <button
                                onClick={() => toggleParent(parent.id)}
                                className={`p-1 hover:bg-gray-50 rounded-lg transition-transform duration-300 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              >
                                <svg
                                  width="12"
                                  height="8"
                                  viewBox="0 0 12 8"
                                  fill="none"
                                  className="text-gray-400"
                                >
                                  <path
                                    d="M1 1.5L6 6.5L11 1.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>

                          {parent.children?.length > 0 && (
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isExpanded
                                  ? "max-h-[500px] opacity-100"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <ul
                                className={`flex flex-col gap-2 mt-1 ${
                                  lang === "ar"
                                    ? "pr-6 border-r border-gray-100 mr-1"
                                    : "pl-6 border-l border-gray-100 ml-1"
                                }`}
                              >
                                {parent.children.map((child) => (
                                  <li key={child.id}>
                                    <a
                                      href={`#${child.id}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const el = document.getElementById(
                                          child.id,
                                        );
                                        if (el) {
                                          window.scrollTo({
                                            top: el.offsetTop - 100,
                                            behavior: "smooth",
                                          });
                                        }
                                      }}
                                      className={`transition-all duration-300 text-base flex items-center gap-2 group ${
                                        activeId === child.id
                                          ? "text-[#F48A42] font-medium"
                                          : "text-[#5B5656] hover:text-[#F48A42]"
                                      }`}
                                    >
                                      <span
                                        className={`h-1 w-1 rounded-full bg-[#F48A42] transition-opacity ${
                                          activeId === child.id
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                        }`}
                                      />
                                      {child.text}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BlogPost;
