export function SectionHeader({
  title,
  description1,
  description2,
  children,
  headingId,
  headingLevel = 2,
  icon: Icon,
}) {
  const Heading = `h${headingLevel}`;
  const parts = title?.split("..");
  const firstPart = parts?.[0];
  const secondPart = parts?.[1]?.trim();

  return (
    <div className="text-center mb-8 md:mb-16">
      <div className="inline-flex items-center gap-2.5 md:gap-3 text-[#FF8C42] font-bold text-xs md:text-sm mb-3.5 md:mb-5 before:content-[''] before:w-[20px] md:before:w-[30px] before:h-[2px] before:bg-[#FF8C42] after:content-[''] after:w-[20px] md:after:w-[30px] after:h-[2px] after:bg-[#FF8C42]">
        {Icon && <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        {description1}
      </div>
      <Heading
        id={headingId}
        className="text-[22px] sm:text-[30px] md:text-[42px] font-black text-[#1A1A2E] mb-3 md:mb-4 leading-[1.3]"
      >
        {secondPart ? (
          <>
            {firstPart}..{" "}
            <span className="font-black relative inline-block bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent after:content-[''] after:absolute after:-bottom-1 after:start-0 after:w-full after:h-[3px] after:bg-gradient-to-r after:from-[#FF8C42] after:to-[#FF6B35] after:rounded-full">
              {secondPart}
            </span>
          </>
        ) : (
          title
        )}
      </Heading>
      <p className="text-sm sm:text-base md:text-lg text-[#666] max-w-[600px] mx-auto leading-[1.7] md:leading-[1.8] px-4 md:px-0">
        {description2}
      </p>
      {children}
    </div>
  );
}
