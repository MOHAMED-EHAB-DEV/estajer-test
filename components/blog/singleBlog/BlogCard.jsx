"use client";

import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({ blog, isLatestPosts, card }) {
  const createdDate = new Date(blog.createdAt);

  return (
    <Link
      href={`/blogs/${blog.urlName}`}
      className={`bg-white  p-4 border border-[#B3B3B380] ${
        isLatestPosts
          ? `grid ${card ? "grid-cols-1 gap-2" : "grid-cols-[30%_65%] gap-6"} items-center`
          : ""
      }`}
    >
      <div className="h-full">
        <div
          className={
            isLatestPosts
              ? "aspect-square object-cover relative h-full"
              : "w-full aspect-[1.5/1] relative mb-6 h-full"
          }
        >
          <Image
            unoptimized
            src={anyImgUrl({
              src: blog.thumbnail.preview,
              size: 500,
            })}
            alt="Blog Image"
            fill
            className={`h-full w-full object-cover ${
              !isLatestPosts && "rounded-lg"
            }`}
          />
          {!isLatestPosts && (
            <div className="absolute top-0 right-0 bg-darkNavy text-white py-2 px-4">
              {createdDate.getDate()}/{createdDate.getMonth() + 1}/
              {createdDate.getFullYear()}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isLatestPosts && (
          <div className="bg-darkNavy text-white w-fit py-[6px] px-4 text-sm">
            {createdDate.getDate()}/{createdDate.getMonth() + 1}/
            {createdDate.getFullYear()}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="md:text-lg font-semibold font-IBMPlex">
            {blog.title}
          </div>
          <div className="text-[#9393A1] truncate font-NotoSansArabic">
            {blog.content}
          </div>
        </div>
      </div>
    </Link>
  );
}
