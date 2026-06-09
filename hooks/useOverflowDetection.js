import { useState, useRef, useCallback, useLayoutEffect } from "react";

export function useOverflowDetection(dependencies = [], maxLines = 6) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const elementRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const checkOverflow = useCallback(() => {
    if (!elementRef.current) return;

    // Use requestAnimationFrame to defer DOM queries until after layout
    requestAnimationFrame(() => {
      if (!elementRef.current) return;

      const element = elementRef.current;

      try {
        // Method 1: Compare scrollHeight with clientHeight
        const hasScrollOverflow =
          element.scrollHeight > element.clientHeight + 5;

        setIsOverflowing(hasScrollOverflow);
      } catch (error) {
        console.warn("Error checking overflow:", error);
        setIsOverflowing(false);
      }
    });
  }, []);

  useLayoutEffect(() => {
    // Use ResizeObserver for better performance
    if (typeof ResizeObserver !== "undefined" && elementRef.current) {
      resizeObserverRef.current = new ResizeObserver(checkOverflow);
      resizeObserverRef.current.observe(elementRef.current);
    }

    // Initial check
    checkOverflow();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, maxLines]);

  return {
    ref: elementRef,
    isOverflowing,
    checkOverflow,
  };
}
