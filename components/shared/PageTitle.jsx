import { Cloud } from "../ui/svgs/icons/CloudSvg";;

export default function PageTitle({ lang, title, description }) {
  return (
    <div className="relative mt-10 mb-16">
      <div className="max-w-screen-3xl w-full relative m-auto">
        <div className="max-w-[315px] md:max-w-[630px] absolute top-1 -start-12">
          <div {...(lang === "en" ? { className: "-scale-x-100 w-max" } : {})}>
            <Cloud />
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-4 relative">
        <h1 className="lg:text-[2.6rem] md:text-[2.4rem] text-[1.9rem] mb-1 font-semibold text-primary font-IBMPlex">
          {title}
        </h1>
        <p className="lg:text-[1.7rem] md:text-[1.5rem] text-[1rem] text-darkNavy ">
          {description}
        </p>
      </div>
    </div>
  );
}
