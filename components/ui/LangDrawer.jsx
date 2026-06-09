import { Drawer, DrawerContent } from "@heroui/react";
import { ChevronLeft } from "./svgs/icons/ChevronLeftSvg";
import { X } from "./svgs/icons/XSvg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";

function NavLink({ href, text, lang, setOpen, url, isDisabled, title }) {
  return (
    <Button
      as={Link}
      color="transparent"
      size="md"
      onPress={() => setOpen(true)}
      href={href}
      title={title || text}
      isDisabled={isDisabled}
      className="bg-[#F6F6F6] h-16 rounded-md p-4 font-semibold w-full flex items-center justify-between gap-2"
    >
      <div className="flex gap-2 items-center border-e h-8 pl-2 me-2">
        <img src={url} alt="Saudi Flag" className="h-4 w-6" />
        <span>{text}</span>
      </div>
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

export default function LangDrawer({ open, setOpen, lang, trans }) {
  const t = (text) => trans(`langDrawer.${text}`);
  const pathname = usePathname();

  const pageName = pathname.replace("/en", "");
  return (
    <>
      <Drawer
        classNames={{ wrapper: "md:hidden", backdrop: "md:hidden" }}
        isOpen={open}
        placement="bottom"
        hideCloseButton
        onOpenChange={setOpen}
      >
        <DrawerContent>
          <div className="py-4 px-6">
            <div className="flex justify-between items-center border-b py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDDCA680] rounded-full flex items-center justify-center">
                  <svg width={32} height={32} viewBox="0 0 33 32" fill={"#"}>
                    <path d="M16.5 32C14.2867 32 12.2067 31.5797 10.26 30.7392C8.31333 29.8987 6.62 28.7589 5.18 27.32C3.74 25.8811 2.60027 24.1877 1.7608 22.24C0.921335 20.2923 0.501069 18.2123 0.500002 16C0.498935 13.7877 0.919202 11.7077 1.7608 9.76C2.6024 7.81226 3.74213 6.11893 5.18 4.68C6.61787 3.24107 8.3112 2.10133 10.26 1.2608C12.2088 0.420267 14.2888 0 16.5 0C18.7112 0 20.7912 0.420267 22.74 1.2608C24.6888 2.10133 26.3821 3.24107 27.82 4.68C29.2579 6.11893 30.3981 7.81226 31.2408 9.76C32.0835 11.7077 32.5032 13.7877 32.5 16C32.4968 18.2123 32.0765 20.2923 31.2392 22.24C30.4019 24.1877 29.2621 25.8811 27.82 27.32C26.3779 28.7589 24.6845 29.8992 22.74 30.7408C20.7955 31.5824 18.7155 32.0021 16.5 32ZM16.5 28.8C20.0733 28.8 23.1 27.56 25.58 25.08C28.06 22.6 29.3 19.5733 29.3 16C29.3 15.8133 29.2936 15.6197 29.2808 15.4192C29.268 15.2187 29.2611 15.0523 29.26 14.92C29.1267 15.6933 28.7667 16.3333 28.18 16.84C27.5933 17.3467 26.9 17.6 26.1 17.6H22.9C22.02 17.6 21.2669 17.2869 20.6408 16.6608C20.0147 16.0347 19.7011 15.2811 19.7 14.4V12.8H13.3V9.6C13.3 8.72 13.6136 7.96693 14.2408 7.3408C14.868 6.71466 15.6211 6.40106 16.5 6.4H18.1C18.1 5.78666 18.2669 5.24693 18.6008 4.7808C18.9347 4.31467 19.3411 3.9344 19.82 3.64C19.2867 3.50667 18.7469 3.4 18.2008 3.32C17.6547 3.24 17.0877 3.2 16.5 3.2C12.9267 3.2 9.9 4.44 7.42 6.92C4.94 9.4 3.7 12.4267 3.7 16H11.7C13.46 16 14.9667 16.6267 16.22 17.88C17.4733 19.1333 18.1 20.64 18.1 22.4V24H13.3V28.4C13.8333 28.5333 14.3603 28.6336 14.8808 28.7008C15.4013 28.768 15.9411 28.8011 16.5 28.8Z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold font-IBMPlex">
                  {t("lang")}
                </span>
              </div>
              <Button
                color="transparent"
                onPress={() => setOpen(false)}
                variant="light"
                size="md"
                className="min-w-8 p-0 -me-1"
              >
                <X className="text-[#0D092B] w-[22px] h-[22px]"></X>
              </Button>
            </div>
            <div className="mt-8 mb-4">
              <NavLink
                url="https://www.worldometers.info/img/flags/small/tn_sa-flag.gif"
                href={pageName || "/"}
                text={t("arabic")}
                title={t("arabic")}
                lang={lang}
                setOpen={setOpen}
                isDisabled={lang === "ar"}
              />
            </div>
            <div className="mb-12">
              <NavLink
                url="https://www.worldometers.info/img/flags/uk-flag.gif"
                href={`/en${pageName}`}
                text={t("english")}
                title={t("english")}
                lang={lang}
                setOpen={setOpen}
                isDisabled={lang === "en"}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
