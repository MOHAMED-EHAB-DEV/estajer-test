"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { twMerge } from "tailwind-merge";

const TabsContext = createContext(null);

export function Tabs({
  children,
  selectedKey,
  onSelectionChange,
  variant = "underlined",
  classNames = {},
  className,
  ...props
}) {
  const [internalKey, setInternalKey] = useState(null);
  const activeKey = selectedKey !== undefined ? selectedKey : internalKey;
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsRef = useRef(new Map());
  const containerRef = useRef(null);

  const tabsArray = React.Children.toArray(children).filter(c => c?.type === Tab);
  const getTabKey = (c) => c.key != null ? String(c.key).replace(/^\.\$/, "") : (c.props.itemKey || c.props.value);
  const tabKeys = tabsArray.map(getTabKey);

  useEffect(() => {
    // Only set default if not controlled
    if (selectedKey === undefined && !internalKey) {
      if (tabKeys.length > 0) setInternalKey(tabKeys[0]);
    }
  }, [children, selectedKey, internalKey, tabKeys]);

  const updateIndicator = useCallback(() => {
    const activeTabElement = tabsRef.current.get(activeKey);
    if (activeTabElement && containerRef.current) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
        opacity: 1
      });
    }
  }, [activeKey]);

  useEffect(() => {
    updateIndicator();
    
    // Listen for resize to update indicator position
    window.addEventListener("resize", updateIndicator);
    
    let observer;
    if (containerRef.current) {
      observer = new ResizeObserver(() => {
        updateIndicator();
      });
      observer.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener("resize", updateIndicator);
      if (observer) observer.disconnect();
    };
  }, [updateIndicator]);

  const handleSelectionChange = (key) => {
    if (selectedKey === undefined) setInternalKey(key);
    if (onSelectionChange) onSelectionChange(key);
  };

  const handleKeyDown = (e) => {
    const currentIndex = tabKeys.indexOf(activeKey);
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabKeys.length;
      handleSelectionChange(tabKeys[nextIndex]);
      tabsRef.current.get(tabKeys[nextIndex])?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length;
      handleSelectionChange(tabKeys[prevIndex]);
      tabsRef.current.get(tabKeys[prevIndex])?.focus();
    }
  };

  const variants = {
    underlined: "border-b border-divider",
    solid: "bg-default-100 rounded-2xl p-1",
  };

  return (
    <TabsContext.Provider value={{ activeKey, onSelectionChange: handleSelectionChange, registerTab: (key, el) => tabsRef.current.set(key, el), classNames }}>
      <div data-slot="base" className={twMerge("relative flex flex-col gap-4 w-full", classNames.base, className)} {...props}>
        <div 
          ref={containerRef}
          role="tablist"
          data-slot="tabList"
          onKeyDown={handleKeyDown}
          className={twMerge("relative flex w-full items-center outline-none", variants[variant], classNames.tabList)}
        >
          {React.Children.map(children, (child) => {
            if (child?.type === Tab) {
              const key = getTabKey(child);
              return React.cloneElement(child, { itemKey: key });
            }
            return null;
          })}
          
          {/* Active Indicator */}
          {indicatorStyle.width > 0 && (
            <div
              data-slot="cursor"
              className={twMerge(
                "absolute transition-all duration-300 ease-out pointer-events-none",
                variant === "underlined" ? "bottom-0 h-0.5 bg-primary" : "h-full bg-white shadow-sm rounded-xl top-0",
                classNames.cursor
              )}
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity,
              }}
            />
          )}
        </div>
        
        {/* Render Active Panel */}
        <div data-slot="panel" className={twMerge("w-full outline-none", classNames.panel)} role="tabpanel" tabIndex={0}>
          {React.Children.map(children, (child) => {
            if (child?.type === Tab) {
              const childKey = getTabKey(child);
              if (childKey === activeKey && child.props.children) {
                return child.props.children;
              }
            }
            return null;
          })}
        </div>
      </div>
    </TabsContext.Provider>
  );
}

export function Tab({ title, value, itemKey, className, ...props }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tab must be used within Tabs");

  const resolvedKey = itemKey || value;
  const isActive = context.activeKey === resolvedKey;

  return (
    <button
      ref={(el) => { if (el) context.registerTab(resolvedKey, el); }}
      onClick={() => context.onSelectionChange(resolvedKey)}
      role="tab"
      data-slot="tab"
      data-selected={isActive ? "true" : "false"}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={twMerge(
        "relative flex items-center justify-center px-4 py-2 outline-none select-none transition-colors z-10",
        isActive ? "text-primary font-medium" : "text-default-500 hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl",
        context.classNames?.tab,
        className
      )}
      type="button"
      {...props}
    >
      <span data-slot="tabContent" className={twMerge("truncate", context.classNames?.tabContent)}>
        {title}
      </span>
    </button>
  );
}
