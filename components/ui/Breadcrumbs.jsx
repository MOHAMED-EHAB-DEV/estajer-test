import Link from "next/link";
import { Home } from "./svgs/Dashboard";

// The SVG arrow separator
const Separator = () => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="1em">
    <path d="m9 18 6-6-6-6"></path>
  </svg>
);

export default function Breadcrumbs({
  lang,
  product,
  requested,
  categoriesData,
  subCategoriesData,
  items,
  textClassName,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";

  let BreadcrumbItems = items;

  if (!BreadcrumbItems && product) {
    BreadcrumbItems =[
      { href: `/${langPrefix}`, text: lang === "ar" ? "الرئيسية" : "Home" },
      ...(requested
        ? []
        :[
            ...(categoriesData?.find(({ key }) => key === product.category)?.label
              ?[
                  {
                    href: `/${langPrefix}${product.category}/products`,
                    text: categoriesData?.find(({ key }) => key === product.category)?.label,
                  },
                ]
              :[]),
            ...(product.subCategory && subCategoriesData?.[product.category]?.find(({ key }) => key === product.subCategory)?.label
              ?[
                  {
                    href: `/${langPrefix}${product.category}/${product.subCategory}/products`,
                    text: subCategoriesData?.[product.category]?.find(({ key }) => key === product.subCategory)?.label,
                  },
                ]
              :[]),
          ]),
      { text: product.name },
    ];
  }

  if (!BreadcrumbItems) return null;

  const baseTextClass = textClassName || "lg:text-[1.3rem] md:text-[1.2rem] text-[0.75rem]";

  return (
    <nav
      aria-label="breadcrumb"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
      className="hidden md:flex"
    >
      <ol className="flex flex-wrap list-none items-center">
        {BreadcrumbItems.map((item, idx) => {
          const isLast = idx === BreadcrumbItems.length - 1;
          const hasHref = Boolean(item.href);

          return (
            <li
              key={idx}
              className="flex items-center max-w-full"
              itemScope
              itemType="https://schema.org/ListItem"
              itemProp="itemListElement"
            >
              <span
                className={`flex gap-1 items-center whitespace-nowrap transition-opacity truncate ${baseTextClass} ${
                  hasHref ? "text-darkNavy hover:opacity-80 cursor-pointer" : "text-gray-500 cursor-default"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {idx === 0 && (
                  <Home
                    color="#f48a42"
                    className={textClassName ? "w-4 h-4" : "md:w-6 md:h-6 w-4 h-4"}
                  />
                )}
                
                {hasHref ? (
                  <Link href={item.href} className="flex items-center gap-2" itemProp="name">
                    {item.text}
                  </Link>
                ) : (
                  <span itemProp="name">{item.text}</span>
                )}

                {hasHref && (
                  <meta
                    itemProp="item"
                    content={`${process.env.NEXT_PUBLIC_APP_URL || ''}${item.href}`}
                  />
                )}
                <meta itemProp="position" content={idx + 1} />
              </span>

              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`px-1 rtl:rotate-180 text-foreground/50 ${
                    textClassName
                      ? "[&>svg]:w-4 [&>svg]:h-4[&>svg]:text-darkNavy"
                      : "[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6 [&>svg]:text-darkNavy"
                  }`}
                >
                  <Separator />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}