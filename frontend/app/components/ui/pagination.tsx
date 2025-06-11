'use client';

import { React, forwardRef } from '../../lib/reactHelpers';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = (props: any) => (
  <div className={cn("flex justify-center", props.className)} {...props} />
);

const PaginationContent = React.forwardRef((props: any, ref: any) => (
  <div
    ref={ref}
    className={cn("flex flex-row items-center gap-1", props.className)}
    {...props}
  />
));

const PaginationItem = React.forwardRef((props: any, ref: any) => (
  <div ref={ref} className={cn("", props.className)} {...props} />
));

const PaginationLink = (props: any) => {
  const { className, isActive, size = "icon", ...otherProps } = props;
  
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 rounded-md px-3",
        size === "lg" && "h-11 rounded-md px-8",
        size === "icon" && "h-10 w-10",
        className
      )}
      {...otherProps}
    />
  );
};

const PaginationPrevious = (props: any) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", props.className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);

const PaginationNext = (props: any) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", props.className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);

const PaginationEllipsis = (props: any) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", props.className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
}; 