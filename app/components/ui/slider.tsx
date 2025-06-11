"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../../utils/cn"

interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef(
  ({ className, ...props }: SliderProps, ref: any) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <SliderPrimitive.Range className="absolute h-full bg-slate-900 dark:bg-slate-300" />
    </SliderPrimitive.Track>
    {props.value?.map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className="block h-5 w-5 rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-300 dark:bg-slate-800 dark:ring-offset-slate-800 dark:focus-visible:ring-slate-600"
      />
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider } 