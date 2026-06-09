import Link from "next/link";
import React from "react";
import { Instagram } from "../ui/svgs/icons/InstagramSvg";
import { Facebook } from "../ui/svgs/icons/FacebookSvg";
import { Twitter } from "../ui/svgs/icons/TwitterSvg";
import { Linkedin } from "../ui/svgs/icons/LinkedinSvg";
import { Snapchat } from "../ui/svgs/icons/SnapchatSvg";
import { Tiktok } from "../ui/svgs/icons/TiktokSvg";;

export default function SocialLinks({ t }) {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center text-center pt-8 border-t-2 border-gray-200">
      <p>{t("followUs")}</p>
      <div className="flex justify-center gap-3">
        <Link
          href="https://www.instagram.com/estajercom/"
          target="_blank"
          className="bg-primary rounded-full"
        >
          <Instagram />
        </Link>
        <Link
          href="https://x.com/estajercom"
          target="_blank"
          className="bg-primary rounded-full"
        >
          <Twitter />
        </Link>
        <Link
          href="https://www.linkedin.com/company/estajer/"
          target="_blank"
          className="bg-primary rounded-full"
        >
          <Linkedin />
        </Link>
        <Link
          href="https://www.snapchat.com/add/estajercom?share_id=rs98zQvPEbw&locale=en-SA"
          target="_blank"
          className="bg-primary rounded-full"
        >
          <Snapchat />
        </Link>
        <Link
          href="https://www.tiktok.com/@estajer.com?_t=ZS-8wb93tstx4c&_r=1"
          target="_blank"
          className="bg-primary rounded-full"
        >
          <Tiktok />
        </Link>
        <Link
          href="https://www.facebook.com/estajer"
          target="_blank"
          className="bg-primary rounded-full"
        >
          <Facebook />
        </Link>
      </div>
    </div>
  );
}
