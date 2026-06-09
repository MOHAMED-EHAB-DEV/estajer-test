import { Cloud } from "../ui/svgs/icons/CloudSvg";

export default function CloudSection({ lang, sm }) {
  return (
    <div
      className={`max-w-screen-3xl w-full relative m-auto ${sm ? "hidden md:block" : ""}`}
    >
      <div className="max-w-[315px] md:max-w-[630px] absolute top-1 -start-12">
        <div {...(lang === "en" ? { className: "-scale-x-100 w-max" } : {})}>
          <Cloud />
        </div>
      </div>
    </div>
  );
}
