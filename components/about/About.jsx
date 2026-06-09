import { useTranslations } from "@/hooks/useTranslations";
import { TopSection } from "./TopSection";
import { HeroParticles } from "./HeroParticles";

const About = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`about.about.${text}`);
  return (
    <section
      id="hero"
      className="relative min-h-screen bg-gradient-to-br from-[#FFF8F3] to-[#F9F9F9] flex items-center overflow-hidden pt-24 pb-16 md:py-32 lg:py-40 mt-[-64px]"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,140,66,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,140,66,0.08)_0%,transparent_50%),radial-gradient(circle_at_50%_20%,rgba(255,140,66,0.05)_0%,transparent_50%)]"></div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Shape 1 */}
        <div className="absolute w-[400px] h-[400px] -top-[100px] -start-[100px] rounded-full bg-[rgba(255,140,66,0.1)] animate-[float_8s_ease-in-out_infinite]"></div>
        {/* Shape 2 */}
        <div className="absolute w-[300px] h-[300px] -bottom-[50px] -end-[50px] rounded-full bg-[rgba(255,140,66,0.06)] animate-[float_10s_ease-in-out_infinite_reverse]"></div>
      </div>

      <HeroParticles />

      <TopSection t={t} lang={lang} />
    </section>
  );
};

export default About;
