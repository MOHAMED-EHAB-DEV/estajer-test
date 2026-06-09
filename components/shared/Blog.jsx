"use client";

import { useState } from "react";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import Button from "../ui/Button";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import { Eye } from "@/components/ui/svgs/icons/EyeSvg";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOffSvg";
import ConfirmModal from "../dashboard/ConfirmModal";
import Link from "next/link";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";

export default function Blog({
  lang,
  blog,
  isAdmin,
  setBlogs,
  isLatestPosts,
  translate,
}) {
  const createdDate = new Date(blog.createdAt);
  const trans = useTranslations(translate);
  const t = (value) => trans(`blog.${value}`);
  const [modalData, setModalData] = useState({ show: false });
  const langPrefix = lang === "ar" ? "" : "en/";

  const handleHide = (blogId, hidden) => {
    setModalData({
      show: true,
      title: hidden ? "تأكيد الإظهار" : "تأكيد الإخفاء",
      message: hidden
        ? "هل أنت متأكد من إظهار هذا المقال؟"
        : "هل أنت متأكد من إخفاء هذا المقال؟",
      confirmText: hidden ? "إظهار" : "إخفاء",
      cancelText: "الغاء",
      type: "hide",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/blog/${blogId}`, {
            method: "PATCH",
            body: JSON.stringify({ hidden: !hidden }),
          });
          const data = await res.json();
          if (!data.success)
            return toast.error(
              ToastMessage(data.error || "Error updating blog"),
            );
          await revalidate("/");
          await revalidateWithTag("everyBlog");
          await revalidateWithTag(`blog-${blogId}`);
          toast.success(
            ToastMessage(
              hidden ? "تم إظهار المقال بنجاح" : "تم اخفاء المقال بنجاح",
            ),
          );
          setBlogs((prev) =>
            prev.map((blog) =>
              blog._id === data.data._id
                ? { ...blog, hidden: data.data.hidden }
                : blog,
            ),
          );
          setModalData({ show: false });
        } catch (error) {
          console.error("Error while hiding the blog post", error);
          setModalData({ show: false });
        }
      },
    });
  };

  const handleDelete = (blogId) => {
    setModalData({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا المقال؟",
      confirmText: "حذف",
      cancelText: "إلغاء",
      type: "delete",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/blog/${blogId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            setBlogs((prev) =>
              prev.filter((blog) => blog._id !== data.data._id),
            );
            await revalidate("/");
            await revalidateWithTag("everyBlog");
            await revalidateWithTag(`blog-${blogId}`);
            setModalData({ show: false });
            toast.success(ToastMessage("تم حذف المقال بنجاح"));
          }
        } catch (error) {
          console.error("Error while deleting blog post", error);
          setModalData({ show: false });
        }
      },
    });
  };

  return (
    <>
      <div className="relative w-full h-[300px]  md:h-[550px]">
        {/* Blog Image */}
        <Link href={`/${langPrefix}blogs/${blog.urlName}`}>
          <div className="relative w-full h-full">
            <Image
              src={anyImgUrl({
                src: blog.thumbnail.preview,
                size: 900,
              })}
              alt={blog.altText || "Blog Image"}
              fill
              unoptimized
              className="h-full w-full object-cover z-10"
            />
            <div className="bg-black/20 w-full h-full absolute z-10" />
          </div>
        </Link>

        {/* Blog Card */}
        <div className="absolute bottom-0 md:bottom-8 left-1/2 w-[90%] h-56 md:w-[80%] transform -translate-x-1/2 z-20">
          {/* Date Badge */}
          <div className="bg-[#3C3C4399] text-[#F9FAFC] text-[0.8rem] md:text-medium text font-semibold px-4 py-2 rounded-sm w-fit mx-auto translate-y-2">
            {createdDate.getDate()}/{createdDate.getMonth() + 1}/
            {createdDate.getFullYear()}
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Link href={`/${langPrefix}blogs/${blog.urlName}`}>
              <div className="text-[1rem] md:text-[1.2rem] text-darkNavy line-clamp-1 font-bold font-IBMPlex mb-3">
                {blog.title}
              </div>
              <div className="text-[#9393A1]  line-clamp-3 md:line-clamp-5 font-NotoSansArabic font-medium text-[0.9rem] md:text-[1rem] mb-4">
                {blog.content?.slice(0, 600)}
              </div>
            </Link>

            {/* Admin Buttons */}
            {isAdmin && (
              <div className="flex justify-center items-center gap-3 mt-4">
                <Button
                  color="transparent"
                  className="min-w-0 w-12 p-3 bg-[#EAEEF3] rounded-full"
                  onPress={() => handleHide(blog._id, blog.hidden)}
                >
                  {blog.hidden ? <Eye /> : <EyeOff />}
                </Button>
                <Button
                  as={Link}
                  color="transparent"
                  className="min-w-0 w-12 p-3 bg-[#EAEEF3] rounded-full"
                  href={`/${langPrefix}admin/blogs/edit/${blog._id}`}
                >
                  <Edit size={18} />
                </Button>
                <Button
                  color="transparent"
                  className="min-w-0 w-12 p-3 bg-[#EAEEF3] rounded-full"
                  onPress={() => handleDelete(blog._id)}
                >
                  <Delete />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {modalData.show && (
        <ConfirmModal
          t={t}
          isOpen={modalData.show}
          onClose={() => setModalData({ show: false })}
          {...modalData}
        />
      )}
    </>
  );
}
