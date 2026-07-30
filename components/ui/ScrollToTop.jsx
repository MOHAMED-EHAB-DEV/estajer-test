"use client";

export default function ScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div onClick={scrollToTop} className="cursor-pointer">
      <div className="relative mx-auto w-10 h-10">
        {/* radial glow */}
        <div className="relative mx-auto">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #f18841 0%, transparent 70%)",
              filter: "blur(15px)",
              transform: "scale(1.2)",
            }}
          />
          <img
            src="/svgs/footer/up-arrow.svg"
            alt="Scroll to top"
            className="relative w-10 h-10"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
