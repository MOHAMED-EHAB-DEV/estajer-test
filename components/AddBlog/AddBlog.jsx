"use client";
import { useTranslations } from "@/hooks/useTranslations";
import ImageUploader from "@/components/addProduct/ImageUploader";
import Button from "@/components/ui/Button";
import { useCallback, useMemo, useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useRouter } from "next/navigation";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(
  async () => {
    await import("react-quill-new/dist/quill.snow.css");
    const { default: RQ, Quill } = await import("react-quill-new");

    // Custom Link format
    const Link = Quill.import("formats/link");
    class CustomLink extends Link {
      static create(value) {
        const node = super.create(value);
        node.setAttribute("class", "text-primary underline");
        return node;
      }
    }
    Quill.register(CustomLink, true);

    // Custom Header format
    const Header = Quill.import("formats/header");
    class CustomHeader extends Header {
      static create(value) {
        const node = super.create(value);
        const classes = {
          2: "text-2xl font-bold mb-4 text-darkNavy",
          3: "text-xl font-bold mb-3 text-darkNavy",
          4: "text-lg font-bold mb-2 text-darkNavy",
          5: "text-base font-bold mb-1 text-darkNavy",
          6: "text-sm font-bold text-darkNavy",
        };
        if (classes[value]) {
          node.setAttribute("class", classes[value]);
        }
        return node;
      }
    }
    Quill.register(CustomHeader, true);

    // Custom Block (Paragraph) format for "Normal" text
    const Block = Quill.import("blots/block");
    class CustomBlock extends Block {
      static create(value) {
        const node = super.create(value);
        node.setAttribute("class", "text-base text-gray-700 leading-relaxed");
        return node;
      }
    }
    Quill.register(CustomBlock, true);

    // Custom Image format to support alt text
    const Image = Quill.import("formats/image");
    class CustomImage extends Image {
      static create(value) {
        const node = super.create(value);
        if (typeof value === "object") {
          node.setAttribute("src", value.url);
          if (value.alt) {
            node.setAttribute("alt", value.alt);
            node.setAttribute("title", value.alt);
          }
        } else node.setAttribute("src", value);
        return node;
      }

      static value(node) {
        return {
          url: node.getAttribute("src"),
          alt: node.getAttribute("alt"),
          title: node.getAttribute("title"),
        };
      }
    }
    Quill.register(CustomImage, true);

    return RQ;
  },
  { ssr: false },
);

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  // Additional formats for paste support
  "color",
  "background",
  "font",
  "size",
  "align",
  "direction",
  "script",
  "code",
  "code-block",
  "video",
];

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      radius="sm"
      classNames={{
        mainWrapper: "mt-10",
        label: "text-lg -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: "text-base",
        inputWrapper: "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function AddBlog({ lang, translate, isEditing, blog }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [blogData, setBlogData] = useState({
    titleAr: blog?.titleAr ? blog.titleAr : "",
    titleEn: blog?.titleEn ? blog.titleEn : "",
    contentAr: blog?.contentAr ? blog.contentAr : "",
    contentEn: blog?.contentEn ? blog.contentEn : "",
    category: blog?.category ? blog.category : "",
    seoTitleAr: blog?.seoTitleAr ? blog.seoTitleAr : "",
    seoTitleEn: blog?.seoTitleEn ? blog.seoTitleEn : "",
    seoDescriptionAr: blog?.seoDescriptionAr ? blog.seoDescriptionAr : "",
    seoDescriptionEn: blog?.seoDescriptionEn ? blog.seoDescriptionEn : "",
    urlName: blog?.urlName ? blog.urlName : "",
    altText: blog?.altText ? blog.altText : "",
    faqs: blog?.faqs ? blog.faqs : [],
  });

  const [blogImage, setBlogImage] = useState(
    blog?.thumbnail ? [blog.thumbnail] : "",
  );

  const handleChange = ({ target: { type, name, value } }) =>
    setBlogData({
      ...blogData,
      [name]: type === "number" ? +value : value,
    });

  // Resize image function (adapted from ImageUploader.jsx)
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const MAX_WIDTH = 1500;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL("image/webp");
          resolve(resizedBase64);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const addBlog = (e) => {
    e.preventDefault();
    if (blogImage === "")
      return toast.error(ToastMessage("يرجي رفع غلاف المقال"));

    setIsLoading(true);
    fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...blogData,
        urlName: blogData.urlName
          .trim()
          .replace(/^\/+|\/+$/g, "")
          .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "")
          .replace(/[\s:-]+/g, "-"),
        thumbnail: blogImage,
      }),
    })
      .then((res) => {
        res.json().then(async (data) => {
          if (!data.success)
            return toast.error(
              ToastMessage(data.error || "Error adding blog post"),
            );
          toast.success(ToastMessage("تم اضافة المقال بنجاح"));
          await revalidateWithTag("everyBlog");
          router.push(`/${langPrefix}blogs`);
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error(ToastMessage("حدث خطأ ما، يرجى المحاولة مرة أخرى."));
      })
      .finally(() => setIsLoading(false));
  };

  const editBlog = async (e) => {
    e.preventDefault();
    if (blogImage === "")
      return toast.error(ToastMessage("يرجي رفع غلاف المقال"));

    setIsLoading(true);
    fetch(`/api/blog/${blog._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...blogData,
        urlName: blogData.urlName
          .trim()
          .replace(/^\/+|\/+$/g, "")
          .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, "")
          .replace(/[\s:-]+/g, "-"),
        thumbnail: blogImage,
      }),
    })
      .then((res) => {
        res.json().then(async (resData) => {
          if (!resData.success)
            return toast.error(
              ToastMessage(resData.error || "Error updating blog post"),
            );
          await revalidateWithTag(`blog-${resData.data._id}`);
          await revalidateWithTag("everyBlog");
          await revalidate("/");
          toast.success(ToastMessage("تم تعديل المقال بنجاح"));
          router.push(`/${langPrefix}admin/blogs`);
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error(ToastMessage("حدث خطأ ما، يرجى المحاولة مرة أخرى."));
      })
      .finally(() => setIsLoading(false));
  };

  const imageHandler = useCallback(function () {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const quill = this.quill;
        const loadingToast = await toast.loading("Processing image...");
        try {
          const resizedBase64 = await resizeImage(file);

          // Manual conversion from base64 to Blob to avoid CSP connect-src violation
          const byteString = atob(resizedBase64.split(",")[1]);
          const mimeString = resizedBase64
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          const body = new FormData();
          body.append("file", blob, file.name);
          const res = await fetch("/api/upload", { method: "POST", body });
          const data = await res.json();
          toast.dismiss(loadingToast);
          if (data.success) {
            // Prompt for alt text
            const altText = prompt("Enter alt text for the image (optional):");
            const range = quill.getSelection(true);
            // Insert image with alt text
            quill.insertEmbed(range.index, "image", {
              url: data.url,
              alt: altText || "",
              title: altText || "",
            });

            toast.success("Image inserted successfully");
          } else {
            toast.error("Image upload failed");
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error("Error processing image");
          console.error(err);
        }
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler],
  );

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={isEditing ? editBlog : addBlog}
    >
      <div className="flex flex-col gap-4">
        <div className="w-full flex flex-col md:flex-row gap-2 justify-center md:items-center">
          <FormInput
            label={"عنوان المقال (العربية)"}
            name="titleAr"
            onChange={handleChange}
            value={blogData.titleAr}
            placeholder={"اكتب عنوان المقال هنا"}
            minLength={2}
            type="text"
          />
          <FormInput
            label={"عنوان المقال (الانجليزية)"}
            name="titleEn"
            onChange={handleChange}
            value={blogData.titleEn}
            placeholder={"اكتب عنوان المقال هنا"}
            minLength={2}
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Select
            label={<span className="text-lg">{trans("search.category")}</span>}
            classNames={{ label: "text-lg", base: "!mt-8" }}
            placeholder={trans("search.category")}
            selectedKeys={blogData.category ? [blogData.category] : []}
            onChange={({ target }) =>
              setBlogData({ ...blogData, category: target.value })
            }
            dir={lang === "ar" ? "rtl" : "ltr"}
            isRequired
            disallowEmptySelection
            labelPlacement="outside"
          >
            {["latestNews", "partnerships", "eventParticipation", "topics"].map(
              (cat) => (
                <SelectItem key={cat} value={cat}>
                  {trans(`blog.categories.${cat}`)}
                </SelectItem>
              ),
            )}
          </Select>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-2 justify-center md:items-center">
          <FormInput
            label={"رابط المقال (Slug)"}
            name="urlName"
            onChange={handleChange}
            value={blogData.urlName}
            placeholder={"write-url-slug-here"}
            minLength={2}
            type="text"
            className="w-full"
          />
        </div>

        <div className="w-full flex flex-col md:flex-row gap-2 justify-center md:items-center">
          <FormInput
            label={"عنوان SEO (العربية)"}
            name="seoTitleAr"
            onChange={handleChange}
            value={blogData.seoTitleAr}
            placeholder={"عنوان SEO بالعربي"}
            type="text"
          />
          <FormInput
            label={"عنوان SEO (الانجليزية)"}
            name="seoTitleEn"
            onChange={handleChange}
            value={blogData.seoTitleEn}
            placeholder={"SEO Title in English"}
            type="text"
          />
        </div>

        <div className="w-full flex flex-col md:flex-row gap-2 justify-center md:items-center">
          <Textarea
            label={"وصف SEO (العربية)"}
            name="seoDescriptionAr"
            onChange={handleChange}
            value={blogData.seoDescriptionAr}
            placeholder={"وصف SEO بالعربي"}
            labelPlacement="outside"
            type="text"
            classNames={{
              input: "text-base",
              label: "text-lg pb-3 flex items-center",
            }}
          />
          <Textarea
            label={"وصف SEO (الانجليزية)"}
            name="seoDescriptionEn"
            onChange={handleChange}
            value={blogData.seoDescriptionEn}
            placeholder={"SEO Description in English"}
            labelPlacement="outside"
            type="text"
            classNames={{
              input: "text-base",
              label: "text-lg pb-3 flex items-center",
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg pb-1 flex items-center">
            محتوي المقال (العربية) <span className="text-danger ml-1">*</span>
          </label>
          <ReactQuill
            theme="snow"
            value={blogData.contentAr}
            onChange={(content) =>
              setBlogData((prev) => ({ ...prev, contentAr: content }))
            }
            placeholder="اضف محتوي المقال بالعربي"
            modules={modules}
            formats={formats}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg pb-1 flex items-center">
            محتوي المقال (الانجليزية){" "}
            <span className="text-danger ml-1">*</span>
          </label>
          <ReactQuill
            theme="snow"
            value={blogData.contentEn}
            onChange={(content) =>
              setBlogData((prev) => ({ ...prev, contentEn: content }))
            }
            placeholder="Add blog content in English"
            modules={modules}
            formats={formats}
            className="editorEn"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="text-xl font-bold text-darkNavy mb-2">
          الأسئلة الشائعة (FAQ)
        </h3>
        {blogData.faqs.map((faq, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 p-4 bg-white rounded-xl border border-gray-100 relative"
          >
            <button
              type="button"
              onClick={() => {
                const newFaqs = [...blogData.faqs];
                newFaqs.splice(index, 1);
                setBlogData({ ...blogData, faqs: newFaqs });
              }}
              className="absolute top-2 left-2 text-danger hover:scale-110 transition-transform"
            >
              حذف
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="السؤال (العربية)"
                value={faq.questionAr}
                onChange={(e) => {
                  const newFaqs = [...blogData.faqs];
                  newFaqs[index].questionAr = e.target.value;
                  setBlogData({ ...blogData, faqs: newFaqs });
                }}
                placeholder="اكتب السؤال بالعربي"
                labelPlacement="outside"
              />
              <Input
                label="Question (English)"
                value={faq.questionEn}
                onChange={(e) => {
                  const newFaqs = [...blogData.faqs];
                  newFaqs[index].questionEn = e.target.value;
                  setBlogData({ ...blogData, faqs: newFaqs });
                }}
                placeholder="Write the question in English"
                labelPlacement="outside"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="الإجابة (العربية)"
                value={faq.answerAr}
                onChange={(e) => {
                  const newFaqs = [...blogData.faqs];
                  newFaqs[index].answerAr = e.target.value;
                  setBlogData({ ...blogData, faqs: newFaqs });
                }}
                placeholder="اكتب الإجابة بالعربية"
                labelPlacement="outside"
              />
              <Textarea
                label="Answer (English)"
                value={faq.answerEn}
                onChange={(e) => {
                  const newFaqs = [...blogData.faqs];
                  newFaqs[index].answerEn = e.target.value;
                  setBlogData({ ...blogData, faqs: newFaqs });
                }}
                placeholder="Write the answer in English"
                labelPlacement="outside"
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            setBlogData({
              ...blogData,
              faqs: [
                ...blogData.faqs,
                {
                  questionAr: "",
                  questionEn: "",
                  answerAr: "",
                  answerEn: "",
                },
              ],
            })
          }
          className="bg-[#F48A42] text-white self-start px-8"
        >
          إضافة سؤال جديد
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-darkNavy font-NotoSansArabic font-semibold text-xl">
          الغلاف
        </label>
        <ImageUploader
          lang={lang}
          files={blogImage}
          setFiles={setBlogImage}
          translate={translate}
          isThumbnail={true}
        />
        <FormInput
          label={"نص بديل للصورة (Alt Text)"}
          name="altText"
          onChange={handleChange}
          value={blogData.altText}
          placeholder={"Alt text for the image"}
          type="text"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 mt-10 mb-20 text-end">
        <Button
          isLoading={isLoading}
          type="submit"
          className="py-7 min-w-60 text-xl font-IBMPlex"
        >
          {isEditing ? "تحديث المقال" : "اضافة المقال"}
        </Button>
      </div>
    </form>
  );
}
