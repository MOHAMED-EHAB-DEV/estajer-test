"use client";

import React from "react";

export default function FaqEditor({
  data,
  onDataChange,
  handleChange,
  lang,
  t,
  labelCls,
  inputCls,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {lang === "ar" ? "العنوان (Ar)" : "Title (Ar)"}
          </label>
          <input
            name="titleAr"
            value={data.titleAr || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            {lang === "ar" ? "العنوان (En)" : "Title (En)"}
          </label>
          <input
            name="titleEn"
            value={data.titleEn || ""}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      <p className={labelCls}>{t("questions")}</p>
      <div className="flex flex-col gap-4">
        {(data.faqs || []).map((faq, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/30 flex flex-col gap-3"
          >
            <input
              value={faq.questionAr || ""}
              onChange={(e) => {
                const newFaqs = [...data.faqs];
                newFaqs[idx].questionAr = e.target.value;
                onDataChange({ ...data, faqs: newFaqs });
              }}
              placeholder={t("question") + " (Ar)"}
              className={inputCls}
            />
            <input
              value={faq.questionEn || ""}
              onChange={(e) => {
                const newFaqs = [...data.faqs];
                newFaqs[idx].questionEn = e.target.value;
                onDataChange({ ...data, faqs: newFaqs });
              }}
              placeholder={t("question") + " (En)"}
              className={inputCls}
            />
            <textarea
              value={faq.answerAr || ""}
              onChange={(e) => {
                const newFaqs = [...data.faqs];
                newFaqs[idx].answerAr = e.target.value;
                onDataChange({ ...data, faqs: newFaqs });
              }}
              placeholder={t("answer") + " (Ar)"}
              className={`${inputCls} h-16 pt-2 resize-none`}
            />
            <textarea
              value={faq.answerEn || ""}
              onChange={(e) => {
                const newFaqs = [...data.faqs];
                newFaqs[idx].answerEn = e.target.value;
                onDataChange({ ...data, faqs: newFaqs });
              }}
              placeholder={t("answer") + " (En)"}
              className={`${inputCls} h-16 pt-2 resize-none`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
