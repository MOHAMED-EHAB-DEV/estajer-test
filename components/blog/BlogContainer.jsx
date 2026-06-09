"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Blog from "../shared/Blog";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@heroui/react";

const BlogContainer = ({
  initialData,
  translate,
  emptyText,
  lang,
  category,
  isAdmin = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState(initialData?.data || []);
  const trans = useTranslations(translate);

  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    setBlogs(initialData?.data || []);
  }, [initialData]);

  const handleCategoryClick = (key) => {
    const langPrefix = lang === "ar" ? "" : `/en`;
    setSelectedCategory(key);
    if (key === "latestNews") {
      router.push(`${langPrefix}/blogs`, { scroll: false });
    } else {
      router.push(`${langPrefix}/blogs/category/${key}`, { scroll: false });
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    const langPrefix = lang === "ar" ? "" : `/en`;
    if (selectedCategory === "latestNews") {
      router.push(`${langPrefix}/blogs?${params.toString()}`);
    } else {
      router.push(`${langPrefix}/blogs/category/${selectedCategory}?${params.toString()}`);
    }
  };

  const categories = [
    { key: "latestNews", label: trans("blog.categories.latestNews") },
    { key: "partnerships", label: trans("blog.categories.partnerships") },
    {
      key: "eventParticipation",
      label: trans("blog.categories.eventParticipation"),
    },
    { key: "topics", label: trans("blog.categories.topics") },
  ];

  return (
    <>
      <div className="col-span-full flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryClick(cat.key)}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 border ${
              (selectedCategory || "latestNews") === cat.key
                ? "bg-[#F48A42] text-white border-[#F48A42] shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#F48A42] hover:text-[#F48A42]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {blogs.length === 0 ? (
        <span className="text-center col-span-full text-black/30">
          {emptyText}
        </span>
      ) : (
        blogs.map((post) => (
          <Blog
            blog={post}
            isAdmin={isAdmin}
            lang={lang}
            translate={translate}
            key={post._id}
            setBlogs={setBlogs}
          />
        ))
      )}
      {initialData?.pagination?.pages > 1 && (
        <div className="col-span-full flex justify-center mt-8">
          <Pagination
            total={initialData.pagination.pages}
            page={initialData.pagination.page}
            onChange={handlePageChange}
            showControls
            showShadow
            color="warning"
            classNames={{
              cursor: "bg-primary text-white",
              prev: lang === "ar" ? "rotate-180" : "",
              next: lang === "ar" ? "rotate-180" : "",
            }}
          />
        </div>
      )}
    </>
  );
};

export default BlogContainer;
