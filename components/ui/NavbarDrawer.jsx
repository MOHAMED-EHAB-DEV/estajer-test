"use client";

import { Drawer, DrawerContent } from "@heroui/react";
import { ChevronLeft } from "./svgs/icons/ChevronLeftSvg";
import { X } from "./svgs/icons/XSvg";
import { User } from "./svgs/icons/UserSvg";
import Link from "next/link";
import Button from "./Button";

function NavLink({ href, text, lang, setOpen, title }) {
  return (
    <Button
      color="transparent"
      size="lg"
      as={Link}
      href={href}
      title={title || text}
      onPress={() => setOpen(true)}
      className="h-16 bg-[#F6F6F6] rounded-md p-4 font-semibold w-full flex items-center justify-between gap-2"
    >
      <span>{text}</span>
      <span
        className={`bg-[#F48A4233] rounded-md p-1 ${
          lang === "ar" ? "" : "rotate-180"
        }`}
      >
        <ChevronLeft />
      </span>
    </Button>
  );
}

export default function NavbarDrawer({ open, setOpen, lang, user, trans }) {
  const t = (value) => trans(`sidebar.${value}`);
  const t2 = (value) => trans(`footer.${value}`);
  const langPrefix = lang === "ar" ? "" : "en/";

  const handleClose = () => setOpen(false);

  const linksData = [
    {
      text: t2("categories"),
      href: `/${langPrefix}#categories`,
      title: t2("categoriesTitle"),
    },
    {
      text: t2("allProducts"),
      href: `/${langPrefix}search/products`,
      title: t2("allProductsTitle"),
    },
    {
      text: t2("createShop"),
      href: `/${langPrefix}rent-flow`,
      title: t2("navigation.mainSite.createShop.title"),
    },
    // {
    //   text: t2("requestedProducts"),
    //   href: `/${langPrefix}#requested-products`,
    //   title: t2("requestedProductsTitle"),
    // },
    {
      text: t2("howToRent"),
      href: `/${langPrefix}#how-to-rent`,
      title: t2("howToRentTitle"),
    },
    {
      text: t2("aboutUs"),
      href: `/${langPrefix}about`,
      title: t2("navigation.about.aboutUs.title"),
    },
    {
      text: t2("faq"),
      href: `/${langPrefix}faq`,
      title: t2("navigation.about.faq.title"),
    },
    {
      text: t2("proposal"),
      href: `/${langPrefix}proposal`,
      title: t2("proposalTitle"),
    },
    { text: t2("blog"), href: `/${langPrefix}blogs`, title: t2("blogTitle") },
    {
      text: t2("terms"),
      href: `/${langPrefix}terms-of-use`,
      title: t2("termsTitle"),
    },
    {
      text: t2("privacy"),
      href: `/${langPrefix}privacy`,
      title: t2("privacyTitle"),
    },
    {
      text: t2("support"),
      href: `/${langPrefix}contact`,
      title: t2("supportTitle"),
    },
  ];
  return (
    <>
      <Drawer
        classNames={{ wrapper: "md:hidden", backdrop: "md:hidden" }}
        isOpen={open}
        placement={lang === "ar" ? "left" : "right"}
        size="full"
        backdrop="transparent"
        onOpenChange={setOpen}
        hideCloseButton
      >
        <DrawerContent>
          <div className="py-4 px-6">
            <div className="flex justify-between items-center border-b py-6">
              {user ? (
                <div className="flex items-center gap-20  w-full px-4">
                  <Link
                    href={`/${langPrefix}dashboard/messages`}
                    title={t("messagesTitle")}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <svg
                      width="32"
                      height="30"
                      viewBox="0 0 32 30"
                      fill="#0D092B"
                    >
                      <path d="M24.2858 0.711537C22.1991 0.488281 19.5185 0.488281 16.07 0.488281H15.93C12.4815 0.488281 9.80093 0.488281 7.71423 0.711537C5.60372 0.939258 3.93228 1.41107 2.5987 2.47675C1.2294 3.57219 0.589397 4.99656 0.287256 6.79303C1.90735e-06 8.50763 0 10.6896 0 13.4103V13.6827C0 16.335 1.90735e-06 18.1701 0.297676 19.538C0.437363 20.2409 0.712902 20.9097 1.10884 21.5071C1.50177 22.0905 2.00186 22.5817 2.59721 23.058C3.93228 24.1251 5.60372 24.5954 7.71423 24.8217C9.80093 25.0464 12.4815 25.0464 15.93 25.0464H16C17.5717 25.0464 18.7728 25.5778 20.029 26.3949C20.538 26.7238 21.0337 27.0855 21.571 27.4799L22.0234 27.8074C22.7304 28.3208 23.5029 28.8641 24.3751 29.3642C24.5448 29.4615 24.7372 29.5125 24.9329 29.512C25.1286 29.5116 25.3208 29.4596 25.4901 29.3615C25.6594 29.2633 25.7999 29.1224 25.8976 28.9528C25.9952 28.7832 26.0466 28.591 26.0465 28.3953V24.5478C27.3548 24.265 28.4621 23.8096 29.4013 23.0594C29.9967 22.5817 30.4982 22.092 30.8897 21.5071C31.2861 20.9098 31.5622 20.241 31.7023 19.538C32 18.1701 32 16.335 32 13.6827V13.4103C32 10.6896 32 8.50763 31.7127 6.79451C31.4106 4.99656 30.7706 3.57219 29.4013 2.47675C28.0677 1.40958 26.3963 0.93777 24.2858 0.711537ZM20.8372 12.7688C20.8372 12.4728 20.9548 12.1889 21.1642 11.9795C21.3735 11.7702 21.6574 11.6526 21.9535 11.6526C22.2495 11.6526 22.5335 11.7702 22.7428 11.9795C22.9522 12.1889 23.0698 12.4728 23.0698 12.7688V13.513C23.0698 13.8091 22.9522 14.093 22.7428 14.3024C22.5335 14.5117 22.2495 14.6293 21.9535 14.6293C21.6574 14.6293 21.3735 14.5117 21.1642 14.3024C20.9548 14.093 20.8372 13.8091 20.8372 13.513V12.7688ZM14.8837 12.7688C14.8837 12.4728 15.0013 12.1889 15.2107 11.9795C15.42 11.7702 15.7039 11.6526 16 11.6526C16.2961 11.6526 16.58 11.7702 16.7893 11.9795C16.9987 12.1889 17.1163 12.4728 17.1163 12.7688V13.513C17.1163 13.8091 16.9987 14.093 16.7893 14.3024C16.58 14.5117 16.2961 14.6293 16 14.6293C15.7039 14.6293 15.42 14.5117 15.2107 14.3024C15.0013 14.093 14.8837 13.8091 14.8837 13.513V12.7688ZM8.93023 12.7688C8.93023 12.4728 9.04784 12.1889 9.25718 11.9795C9.46653 11.7702 9.75046 11.6526 10.0465 11.6526C10.3426 11.6526 10.6265 11.7702 10.8358 11.9795C11.0452 12.1889 11.1628 12.4728 11.1628 12.7688V13.513C11.1628 13.8091 11.0452 14.093 10.8358 14.3024C10.6265 14.5117 10.3426 14.6293 10.0465 14.6293C9.75046 14.6293 9.46653 14.5117 9.25718 14.3024C9.04784 14.093 8.93023 13.8091 8.93023 13.513V12.7688Z" />
                    </svg>
                    <span>{t("messages")}</span>
                  </Link>
                  <Link
                    href={`/${langPrefix}favorites`}
                    title={t("favoritesTitle")}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <svg
                      width="31"
                      height="28"
                      viewBox="0 0 31 28"
                      fill="#0D092B"
                    >
                      <path
                        d="M27.2787 3.80549C25.8293 2.20569 23.8405 1.32458 21.6782 1.32458C20.0619 1.32458 18.5817 1.84459 17.2786 2.87004C16.6211 3.38766 16.0253 4.02093 15.5 4.76007C14.9749 4.02115 14.3789 3.38766 13.7212 2.87004C12.4183 1.84459 10.9381 1.32458 9.32181 1.32458C7.15952 1.32458 5.17047 2.20569 3.72104 3.80549C2.28891 5.38661 1.5 7.54664 1.5 9.88798C1.5 12.2978 2.38248 14.5037 4.2771 16.8303C5.97198 18.9114 8.40793 21.024 11.2288 23.4704C12.192 24.3058 13.2839 25.2528 14.4176 26.2615C14.7171 26.5285 15.1014 26.6754 15.5 26.6754C15.8984 26.6754 16.2829 26.5285 16.582 26.2619C17.7157 25.253 18.8082 24.3056 19.7718 23.4697C22.5923 21.0238 25.0282 18.9114 26.7231 16.83C28.6177 14.5037 29.5 12.2978 29.5 9.88776C29.5 7.54664 28.7111 5.38661 27.2787 3.80549Z"
                        stroke="#0D092B"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <span>{t("favorites")}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#FDDCA680] rounded-full flex items-center justify-center">
                    <User size={28} />
                  </div>
                  <span className="text-xl font-semibold font-IBMPlex">
                    {t("myAccount")}
                  </span>
                </div>
              )}
              <Button
                color="transparent"
                onPress={handleClose}
                variant="light"
                size="md"
                className="min-w-8 p-0 -me-1"
              >
                <X className="text-[#0D092B] w-[22px] h-[22px]"></X>
              </Button>
            </div>
            <div className="flex flex-col gap-4 my-8">
              {linksData.map((link, idx) => (
                <NavLink
                  key={idx}
                  href={link.href}
                  text={link.text}
                  title={link.title}
                  lang={lang}
                  setOpen={setOpen}
                />
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
