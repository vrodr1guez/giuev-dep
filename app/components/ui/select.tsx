/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.HTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  multiple?: boolean;
  size?: number;
  className?: string;
  children?: React.ReactNode;
}

interface SelectItemProps extends React.HTMLAttributes<HTMLOptionElement> {
  className?: string;
  children?: React.ReactNode;
  value?: string;
  disabled?: boolean;
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  placeholder?: string;
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const Select = React.forwardRef(
  ({ className, children, value, onValueChange, ...props }: SelectProps, ref: any) => {
    const handleChange = (e: any) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    );
  }
);
Select.displayName = "Select";

// Simple option component for compatibility
const SelectItem = React.forwardRef(
  ({ className, children, ...props }: SelectItemProps, ref: any) => (
  <option
    ref={ref}
    className={cn("py-1.5 px-2", className)}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";

// Keep the existing components for API compatibility, but make them simpler
const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }: SelectTriggerProps, ref: any) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex items-center justify-between h-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(
  ({ className, ...props }: SelectValueProps, ref: any) => (
  <span
    ref={ref}
    className={cn("block truncate", className)}
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(
  ({ className, children, ...props }: SelectContentProps, ref: any) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg border border-gray-200",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}; 