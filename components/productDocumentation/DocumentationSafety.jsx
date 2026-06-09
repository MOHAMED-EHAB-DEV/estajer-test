import { getTranslations } from "@/hooks/getTranslations";
import { Warning } from "../ui/svgs/icons/WarningSvg";

export default async function DocumentationSafety({ translate, userRole }) {
  const t = (value) => translate(`product.safety.${value}`);
  const tGuidelines = (value) =>
    translate(`product.safety.documentationGuidelines.${value}`);

  return (
    <div>
      <div className="border-[#F48A42] border rounded-2xl overflow-hidden">
        <div className="flex gap-4 py-7 justify-center items-center bg-[#FCE7C5] font-semibold text-darkNavy text-[1.6rem] md:text-[1.8rem] lg:text-[1.9rem]">
          <Warning className="lg:w-10 lg:h-10 w-6 h-6" />
          <span>{t("title")}</span>
        </div>
        <div className="bg-[#EAEEF34D] xl:px-8 p-6 py-8 lg:text-xl md:text-lg text-[#5B5656]">
          <ul>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>

              <span>
                {tGuidelines("point1_main").replace(
                  "{userRole}",
                  tGuidelines(`userRole.${userRole}`),
                )}
                <br />
                {tGuidelines("point1_apps")}
              </span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point2")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point3")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point4")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point5")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point6")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point7")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point8")}</span>
            </li>
            <li className="flex gap-4 mb-1">
              <span className="min-w-2 mt-[0.75rem] h-2 rounded-full bg-[#5B5656] P-4 flex"></span>
              <span>{tGuidelines("point9")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
