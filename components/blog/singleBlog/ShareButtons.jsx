import React from "react";
import { Facebook2 } from "@/components/ui/svgs/icons/Facebook2Svg";
import { Twitter2 } from "@/components/ui/svgs/icons/Twitter2Svg";
import { Telegram } from "@/components/ui/svgs/icons/TelegramSvg";
import { Whatsapp2 } from "@/components/ui/svgs/icons/Whatsapp2Svg";;

const ShareButtons = ({ trans, blogUrl, blogTitle }) => {
  const t = (text) => trans(`singleBlog.shareButtons.${text}`);

  const encodedUrl = encodeURIComponent(blogUrl);
  const encodedTitle = encodeURIComponent(blogTitle);

  return (
    <div className="border-y-1 border-y-[#B3B3B3] flex gap-4 py-8 items-center">
      <span className="font-NotoSansArabic text-darkNavy text-medium">
        {t("shareText")}
      </span>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Facebook2 />
      </a>

      {/* Twitter / X */}
      <a
        href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Twitter2 />
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Telegram />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Whatsapp2 />
      </a>
    </div>
  );
};

export default ShareButtons;
