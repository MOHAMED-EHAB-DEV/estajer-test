import SectionTitle from "../shared/SectionTitle";
import Icons from "../ui/TimeLineIcons";
import { getTranslations } from "@/hooks/getTranslations";
import HowToRentTabs from "./HowToRentTabs";

export default async function HowToRent({ lang }) {
  const translate = await getTranslations(lang, ["home"]);
  const t = (value) => translate(`home.howToRentSection.${value}`);
  const tSteps = (value) => translate(`home.howToRentSection.steps.${value}`);

  const renterSteps = [
    {
      Icon: <Icons.Icon7 />,
      title: tSteps("step1.title"),
      description: tSteps("step1.description"),
    },
    {
      Icon: <Icons.Icon2 />,
      title: tSteps("step2.title"),
      description: tSteps("step2.description"),
    },
    {
      Icon: <Icons.Icon3 />,
      title: tSteps("step3.title"),
      description: tSteps("step3.description"),
    },
    {
      Icon: <Icons.Icon5 />,
      title: tSteps("step4.title"),
      description: tSteps("step4.description"),
    },
  ];

  const lessorSteps = [
    {
      Icon: <Icons.Icon1 />,
      title: tSteps("step5.title"),
      description: tSteps("step5.description"),
    },
    {
      Icon: <Icons.Icon9 />,
      title: tSteps("step7.title"),
      description: tSteps("step7.description"),
    },
    {
      Icon: <Icons.Icon4 />,
      title: tSteps("step8.title"),
      description: tSteps("step8.description"),
    },
    {
      Icon: <Icons.Icon8 />,
      title: tSteps("step9.title"),
      description: tSteps("step9.description"),
    },
  ];

  const renterButton = {
    title: tSteps("step11.title"),
    href: lang === "ar" ? "/register" : "/en/register",
  };

  const lessorButton = {
    title: tSteps("step10.title"),
    href: lang === "ar" ? "/register" : "/en/register",
  };

  // Schema markup for how to rent process
  const howToRentSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("title"),
    description: t("description"),
    step: [
      ...renterSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
      ...lessorSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: renterSteps.length + index + 1,
        name: step.title,
        text: step.description,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToRentSchema) }}
      />
      <section
        id="how-to-rent"
        className="py-20 bg-gray-50"
        aria-labelledby="how-to-rent-heading"
        itemScope
        itemType="https://schema.org/HowTo"
      >
        <header className="text-center mb-12">
          <SectionTitle title={t("title")} text={t("description")} />
        </header>

        <HowToRentTabs
          renterTitle={t("renter")}
          lessorTitle={t("lessor")}
          renterSteps={renterSteps}
          lessorSteps={lessorSteps}
          renterButton={renterButton}
          lessorButton={lessorButton}
          lang={lang}
        />
      </section>
    </>
  );
}
