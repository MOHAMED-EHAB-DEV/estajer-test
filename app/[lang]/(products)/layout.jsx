import InteractionGTM from "@/components/seo/InteractionGTM";
import GTMPageView from "@/hooks/GTMPageView";
import { Suspense } from "react";

export default function ProductsLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <GTMPageView />
      </Suspense>
      {children}
      <InteractionGTM gtmId="GTM-W7PNC244" />
    </>
  );
}
