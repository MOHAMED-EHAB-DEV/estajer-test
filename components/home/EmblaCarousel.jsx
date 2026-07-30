import ProductLight from "../shared/ProductLight";
import MobileProductCarousel from "./MobileProductCarousel";

export default function EmblaCarousel({
  lang,
  initialProducts = [],
  translate,
  shops,
  shopSlug,
  t,
}) {
  return (
    <div>
      <MobileProductCarousel
        initialProducts={initialProducts}
        lang={lang}
        translate={translate}
        shops={shops}
        shopSlug={shopSlug}
      >
        {initialProducts.map((product, index) => (
          <div key={product._id} className="flex-[0_0_215px]">
            <div
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="min-w-0 px-2 md:px-w h-full transition-[opacity,transform] duration-500 ease-out transform md:w-[19rem] opacity-100 translate-y-0 "
            >
              <ProductLight
                sm={true}
                product={product}
                lang={lang}
                translate={translate}
                priority={index < 4}
                shopSlug={shopSlug}
              />
            </div>
          </div>
        ))}
      </MobileProductCarousel>
    </div>
  );
}
