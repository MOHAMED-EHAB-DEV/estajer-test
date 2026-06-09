import React from "react";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import { Calender } from "@/components/ui/svgs/Admin";

const BlogDetails = ({
  image,
  date,
  content,
  category,
  trans,
  title,
  altText,
  faqs,
  lang,
}) => {
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full aspect-[1.5/1] relative mb-6">
        <Image
          src={anyImgUrl({ src: image, size: 1000 })}
          fill
          alt={altText || title}
          title={altText || title}
          unoptimized
          className="h-full w-full object-cover rounded-3xl"
          priority
        />
        {category && (
          <span className="absolute top-4 right-4 bg-[#F48A42] text-white px-4 py-2 rounded-full text-sm font-medium">
            {trans ? trans(`blog.categories.${category}`) : category}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-1 items-center">
          <Calender />
          <span className="font-NotoSansArabic font-medium text-medium text-darkNavy">
            {date}
          </span>
        </div>
        <div
          className="font-NotoSansArabic text-lg md:text-2xl text-[#5B5656] overflow-hidden [overflow-wrap:anywhere] [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-3xl [&>h1]:font-bold [&>h2]:text-2xl [&>h2]:font-bold [&>h3]:text-xl [&>h3]:font-bold"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {faqs && faqs.length > 0 && (
        <div className="mt-12 flex flex-col gap-8">
          <h3 className="text-3xl font-bold text-darkNavy border-r-4 border-[#F48A42] pr-4">
            {trans("blog.frequentlyAskedQuestions")}
          </h3>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
              >
                <button
                  className="w-full flex justify-between items-center p-8 text-right hover:bg-gray-50/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-xl font-bold text-darkNavy">
                    {lang === "ar" ? faq.questionAr : faq.questionEn}
                  </span>
                  <div
                    className={`h-8 w-8 rounded-full bg-[#F48A42]/10 flex items-center justify-center transition-transform duration-300 ${
                      openFaq === index
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
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-8 pt-0 border-t border-gray-50">
                    <p className="text-[#5B5656] text-lg md:text-xl leading-relaxed whitespace-pre-line">
                      {lang === "ar" ? faq.answerAr : faq.answerEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default BlogDetails;
