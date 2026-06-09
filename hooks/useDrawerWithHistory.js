"use client";

import { useDisclosure } from "@heroui/react";
import { useEffect, useRef } from "react";

export function useDrawerWithHistory() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const historyStateRef = useRef(false);
  // Handle opening the drawer with history state
  const handleOpenDrawer = () => {
    onOpen();
    // Push a new history state when drawer opens
    if (!historyStateRef.current) {
      window.history.pushState({ drawerOpen: true }, "", window.location.href);
      historyStateRef.current = true;
    }
  };

  // Handle closing the drawer
  const handleCloseDrawer = (isOpen) => {
    onOpenChange(isOpen);

    if (!isOpen && historyStateRef.current) {
      // If drawer is being closed and we have a history state, go back
      historyStateRef.current = false;
      if (window.history.state?.drawerOpen) {
        window.history.back();
      }
    }
  };

  // Listen for browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (isOpen && historyStateRef.current) {
        // Close drawer when back button is pressed
        onOpenChange(false);
        historyStateRef.current = false;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onOpenChange]);

  // Clean up history state when component unmounts
  useEffect(() => {
    return () => {
      if (historyStateRef.current && window.history.state?.drawerOpen)
        window.history.back();
    };
  }, []);

  return {
    isOpen: isOpen,
    onOpen: handleOpenDrawer,
    onOpenChange: handleCloseDrawer,
  };
}
