/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

const Table = React.forwardRef(
  ({ className, ...props }: TableProps, ref: any) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

const TableHeader = React.forwardRef(
  ({ className, ...props }: TableSectionProps, ref: any) => (
  <thead ref={ref} className={cn("bg-gray-50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(
  ({ className, ...props }: TableSectionProps, ref: any) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-gray-200", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(
  ({ className, ...props }: TableSectionProps, ref: any) => (
  <tfoot
    ref={ref}
    className={cn("bg-gray-50 font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

const TableRow = React.forwardRef(
  ({ className, ...props }: TableRowProps, ref: any) => (
  <tr
    ref={ref}
    className={cn("border-b transition-colors hover:bg-gray-50", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

const TableHead = React.forwardRef(
  ({ className, ...props }: TableCellProps, ref: any) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-gray-500",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(
  ({ className, ...props }: TableCellProps, ref: any) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  className?: string;
}

const TableCaption = React.forwardRef(
  ({ className, ...props }: TableCaptionProps, ref: any) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-500", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}; 