"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { DayPicker } from "react-day-picker"
import { format, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Fecha", className }: DatePickerProps) {
  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined
  const hasValue = parsed !== undefined && isValid(parsed)

  return (
    <PopoverPrimitive.Root>
      <div className={cn("relative flex items-center w-full md:w-auto", className)}>
        <PopoverPrimitive.Trigger
          className={cn(
            "flex items-center gap-2 pl-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer w-full min-w-[148px]",
            hasValue ? "pr-8" : "pr-3"
          )}
        >
          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={cn("flex-1 text-left whitespace-nowrap", hasValue ? "text-slate-900 dark:text-white" : "text-slate-400")}>
            {hasValue ? format(parsed!, "dd/MM/yyyy") : placeholder}
          </span>
        </PopoverPrimitive.Trigger>
        {hasValue && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange("") }}
            className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            aria-label="Limpiar fecha"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <PopoverPrimitive.Popup className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-3 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 origin-(--transform-origin)">
            <DayPicker
              mode="single"
              selected={hasValue ? parsed : undefined}
              onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              locale={es}
              classNames={{
                root: "",
                months: "flex flex-col",
                month: "space-y-2",
                month_caption: "flex items-center justify-between px-1",
                caption_label: "text-sm font-semibold text-slate-900 dark:text-white capitalize",
                nav: "flex items-center gap-1",
                button_previous: "p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer",
                button_next: "p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer",
                month_grid: "w-full border-collapse mt-2",
                weekdays: "flex",
                weekday: "text-xs font-medium text-slate-400 dark:text-slate-500 w-9 h-8 flex items-center justify-center",
                week: "flex mt-1",
                day: "w-9 h-9 p-0",
                day_button: "w-full h-full flex items-center justify-center rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer font-normal",
                selected: "[&>button]:!bg-blue-600 [&>button]:!text-white [&>button]:hover:!bg-blue-700",
                today: "[&>button]:font-semibold [&>button]:text-blue-600 dark:[&>button]:text-blue-400",
                outside: "[&>button]:text-slate-300 dark:[&>button]:text-slate-600",
                disabled: "[&>button]:opacity-30 [&>button]:pointer-events-none",
                hidden: "invisible",
              }}
            />
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
