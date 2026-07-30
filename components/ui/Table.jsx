"use client";

import React, { createContext, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "./Checkbox";

const TableContext = createContext(null);

export function Table({
  children,
  className,
  classNames = {},
  ariaLabel,
  bottomContent,
  selectionMode = "none", // "none", "single", "multiple"
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  radius = "lg",
  shadow = "sm",
  removeWrapper = false,
  ...props
}) {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState(
    defaultSelectedKeys ? new Set(defaultSelectedKeys) : new Set()
  );
  const [columns, setColumns] = useState([]);
  
  const currentSelectedKeys = selectedKeys !== undefined 
    ? (selectedKeys === "all" ? "all" : new Set(selectedKeys)) 
    : internalSelectedKeys;

  const toggleSelection = (key) => {
    let next;
    if (currentSelectedKeys === "all") {
      next = new Set();
    } else {
      next = new Set(currentSelectedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (selectionMode === "single") {
          next.clear();
        }
        next.add(key);
      }
    }
    
    if (selectedKeys === undefined) setInternalSelectedKeys(next);
    if (onSelectionChange) onSelectionChange(next);
  };

  const toggleAll = (allKeys) => {
    if (currentSelectedKeys === "all" || (currentSelectedKeys.size === allKeys.length && allKeys.length > 0)) {
      if (selectedKeys === undefined) setInternalSelectedKeys(new Set());
      if (onSelectionChange) onSelectionChange(new Set());
    } else {
      if (selectedKeys === undefined) setInternalSelectedKeys(new Set(allKeys));
      if (onSelectionChange) onSelectionChange(new Set(allKeys));
    }
  };

  const radiuses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-2xl", // Match HeroUI large radius for Table wrappers
    xl: "rounded-3xl",
  };

  const shadows = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const tableContent = (
    <table data-slot="table" className={twMerge("w-full text-sm text-start text-card-foreground", classNames.table)}>
      {children}
    </table>
  );

  return (
    <TableContext.Provider value={{
      selectionMode,
      selectedKeys: currentSelectedKeys,
      toggleSelection,
      toggleAll,
      sortDescriptor,
      onSortChange,
      classNames,
      columns,
      setColumns
    }}>
      <div data-slot="base" className={twMerge("flex flex-col gap-4", classNames.base, className)} {...props} aria-label={ariaLabel}>
        {removeWrapper ? (
          tableContent
        ) : (
          <div data-slot="wrapper" className={twMerge("relative w-full overflow-x-auto bg-content1", radiuses[radius] || radiuses.lg, shadows[shadow] || shadows.sm, classNames.wrapper)}>
            {tableContent}
          </div>
        )}
        {bottomContent && (
          <div className="py-2 px-2 flex justify-between items-center">
            {bottomContent}
          </div>
        )}
      </div>
    </TableContext.Provider>
  );
}

export function TableHeader({ children, className, columns, ...props }) {
  const context = useContext(TableContext);
  
  // We need to know all row keys to implement "select all".
  // In a real implementation, we'd pass all items or keys down.
  // For now, if selectionMode="multiple", we render a header checkbox that might not toggle ALL perfectly without items prop.
  // We assume the user manages "all" via controlled state if they need it.
  
  React.useEffect(() => {
    if (columns && context?.setColumns) {
      context.setColumns(columns);
    }
  }, [columns, context?.setColumns]);

  const isAllSelected = context?.selectedKeys === "all";

  const content = typeof children === "function"
    ? (columns ? columns.map((col) => children(col)) : null)
    : children;

  return (
    <thead data-slot="thead" className={twMerge("text-xs text-default-500 bg-default-100 uppercase", className)} {...props}>
      <tr data-slot="tr">
        {context?.selectionMode === "multiple" && (
          <th className="px-4 py-3 w-10">
            <Checkbox 
              isSelected={isAllSelected} 
              onValueChange={(isSelected) => {
                // If we don't have the keys, we just pass empty or mock.
                // It's best if the user controls it via selectedKeys="all"
                context.toggleAll([]); 
              }}
              aria-label="Select All"
            />
          </th>
        )}
        {content}
      </tr>
    </thead>
  );
}

export function TableColumn({ children, className, allowsSorting, ...props }) {
  const context = useContext(TableContext);
  const sortKey = props.id || props["data-key"]; // Usually columns have a key passed as id or data-key
  
  const isSorted = context?.sortDescriptor?.column === sortKey;
  const direction = context?.sortDescriptor?.direction;

  const handleSort = () => {
    if (!allowsSorting || !context?.onSortChange || !sortKey) return;
    
    let newDirection = "ascending";
    if (isSorted && direction === "ascending") {
      newDirection = "descending";
    }
    
    context.onSortChange({ column: sortKey, direction: newDirection });
  };

  return (
    <th 
      scope="col" 
      data-slot="th"
      onClick={allowsSorting ? handleSort : undefined}
      className={twMerge(
        "px-6 py-3 font-medium tracking-wider select-none", 
        allowsSorting && "cursor-pointer hover:text-foreground transition-colors",
        className
      )} 
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {allowsSorting && isSorted && (
          <svg
            className={twMerge("w-4 h-4 transition-transform", direction === "descending" ? "rotate-180" : "")}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>
    </th>
  );
}

export function TableBody({ children, className, items, emptyContent, ...props }) {
  // If children is a function and items are provided, map over items
  // If children is a function but no items, we can't really map, but handle just in case
  const content = typeof children === "function"
    ? (items ? items.map((item) => children(item)) : null)
    : children;

  const isEmpty = (items && items.length === 0) || React.Children.count(content) === 0;

  return (
    <tbody data-slot="tbody" className={className} {...props}>
      {isEmpty && emptyContent ? (
        <tr data-slot="empty-tr">
          <td colSpan={100} className="text-center p-4 text-default-500">
            {emptyContent}
          </td>
        </tr>
      ) : content}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }) {
  const context = useContext(TableContext);
  const rowKey = props.id || props["data-key"];
  
  const isSelected = context?.selectedKeys === "all" || (context?.selectedKeys instanceof Set && context.selectedKeys.has(rowKey));

  const content = typeof children === "function"
    ? (context?.columns ? context.columns.map((col) => children(col.uid || col.key || col.id)) : null)
    : children;

  return (
    <tr 
      data-slot="tr"
      data-selected={isSelected ? "true" : "false"}
      className={twMerge(
        "border-b border-divider last:border-b-0 hover:bg-default-50 transition-colors", 
        isSelected && "bg-primary/10 hover:bg-primary/20",
        className
      )} 
      {...props}
    >
      {context?.selectionMode !== "none" && context?.selectionMode !== undefined && (
        <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            isSelected={isSelected}
            onValueChange={() => context.toggleSelection(rowKey)}
            aria-label={`Select row ${rowKey}`}
          />
        </td>
      )}
      {content}
    </tr>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td data-slot="td" className={twMerge("px-6 py-4 whitespace-nowrap", className)} {...props}>
      {children}
    </td>
  );
}
