"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseDate(value: string | null) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DashboardPeriodFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseDate(params.get("from")),
    to: parseDate(params.get("to")),
  });

  function apply(next: DateRange | undefined) {
    setRange(next);
    if (!next?.from) return;
    const query = new URLSearchParams(params.toString());
    query.set("from", format(next.from, "yyyy-MM-dd"));
    if (next.to) query.set("to", format(next.to, "yyyy-MM-dd"));
    else query.delete("to");
    router.push(`/dashboard?${query.toString()}`);
  }

  function reset() {
    setRange(undefined);
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !range?.from && "text-muted-foreground",
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {range?.from
              ? range.to
                ? `${format(range.from, "d MMM yyyy", { locale: idLocale })} - ${format(range.to, "d MMM yyyy", { locale: idLocale })}`
                : format(range.from, "d MMM yyyy", { locale: idLocale })
              : "Pilih periode"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border p-0 shadow-lg"
          align="end"
          sideOffset={8}
        >
          <Calendar
            mode="range"
            selected={range}
            onSelect={apply}
            numberOfMonths={2}
            initialFocus
            fixedWeeks
            className="p-6 [--cell-size:2.75rem]"
            classNames={{
              months: "flex flex-col gap-8 sm:flex-row",
              month: "flex w-[19rem] flex-col gap-5",
              month_caption:
                "flex h-9 w-full items-center justify-center px-10",
              caption_label: "text-sm font-semibold capitalize",
              nav: "absolute inset-x-0 top-0 flex items-center justify-between p-4",
              table: "w-full border-collapse",
              weekdays: "grid w-full grid-cols-7",
              weekday:
                "flex h-7 w-full items-center justify-center text-xs font-normal text-muted-foreground",
              week: "mt-2 grid w-full grid-cols-7",
              day: "relative flex h-[--cell-size] w-full items-center justify-center p-0 text-center",
              day_button:
                "flex h-[--cell-size] w-[--cell-size] items-center justify-center rounded-md text-sm font-normal",
              range_start: "rounded-l-md bg-primary/10",
              range_middle: "rounded-none bg-primary/10",
              range_end: "rounded-r-md bg-primary/10",
              today: "rounded-md bg-accent font-semibold",
              outside: "text-muted-foreground/50",
            }}
          />
        </PopoverContent>
      </Popover>
      {range?.from && (
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          aria-label="Reset periode"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
