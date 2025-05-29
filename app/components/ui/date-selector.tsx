"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DateSelectorProps {
  value?: string; // Format: "YYYY-MM-DD"
  onChange?: (date: string) => void;
  disabled?: boolean;
  maxDate?: string;
  id?: string;
  className?: string;
  name?: string;
}

export default function DateSelector({
  value,
  onChange,
  disabled,
  maxDate,
  id,
  className,
  name,
}: DateSelectorProps) {
  const parseDate = (dateString?: string) => {
    if (!dateString) return { day: "", month: "", year: "" };
    const [year, month, day] = dateString.split("-");
    return { day, month, year };
  };

  const [day, setDay] = React.useState<string>("");
  const [month, setMonth] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");

  React.useEffect(() => {
    const { day, month, year } = parseDate(value);
    setDay(day);
    setMonth(month);
    setYear(year);
  }, [value]);

  const getMaxYear = () => {
    return maxDate
      ? parseInt(maxDate.split("-")[0], 10)
      : new Date().getFullYear();
  };

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const years = Array.from({ length: 100 }, (_, i) => String(getMaxYear() - i));

  const emitDateIfComplete = (
    newDay = day,
    newMonth = month,
    newYear = year
  ) => {
    if (newDay && newMonth && newYear) {
      onChange?.(`${newYear}-${newMonth}-${newDay}`);
    }
  };

  return (
    <div id={id} className={cn("flex gap-2", className)}>
      {/* Day */}
      <Select
        value={day || undefined}
        onValueChange={(val) => {
          setDay(val);
          emitDateIfComplete(val, month, year);
        }}
        disabled={disabled}
        name={`${name}-day`}
      >
        <SelectTrigger className="w-32 h-[64px] bg-[#09090B] rounded-xl border">
          <SelectValue placeholder="DD" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Day</SelectLabel>
            {days.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Month */}
      <Select
        value={month || undefined}
        onValueChange={(val) => {
          setMonth(val);
          emitDateIfComplete(day, val, year);
        }}
        disabled={disabled}
        name={`${name}-month`}
      >
        <SelectTrigger className="w-32 h-[64px] bg-[#09090B] rounded-xl border">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Month</SelectLabel>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Year */}
      <Select
        value={year || undefined}
        onValueChange={(val) => {
          setYear(val);
          emitDateIfComplete(day, month, val);
        }}
        disabled={disabled}
        name={`${name}-year`}
      >
        <SelectTrigger className="w-56 h-[64px] bg-[#09090B] rounded-xl border">
          <SelectValue placeholder="YYYY" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Year</SelectLabel>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
