"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DateSelectorProps {
  value?: string; // Expected format: "YYYY-MM-DD"
  onChange?: (date: string) => void;
  disabled?: boolean;
  maxDate?: string; // Expected format: "YYYY-MM-DD"
  id?: string;
  className?: string;
  name?: string; // Optional name prop for form submission
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
  // Parse the value prop to get individual components
  const parseDate = (dateString?: string) => {
    if (!dateString) return { day: "", month: "", year: "" };
    const [year, month, day] = dateString.split("-");
    return { day: day || "", month: month || "", year: year || "" };
  };

  const {
    day: initialDay,
    month: initialMonth,
    year: initialYear,
  } = parseDate(value);

  const [day, setDay] = React.useState<string>(initialDay);
  const [month, setMonth] = React.useState<string>(initialMonth);
  const [year, setYear] = React.useState<string>(initialYear);

  // Update internal state when value prop changes
  React.useEffect(() => {
    const { day: newDay, month: newMonth, year: newYear } = parseDate(value);
    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);
  }, [value]);

  // Calculate max year from maxDate
  const getMaxYear = () => {
    if (maxDate) {
      return Number.parseInt(maxDate.split("-")[0]);
    }
    return new Date().getFullYear();
  };

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const years = Array.from({ length: 100 }, (_, i) =>
    (getMaxYear() - i).toString()
  );

  // Handle individual field changes
  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    if (newDay && month && year) {
      const formattedDate = `${year}-${month}-${newDay}`;
      onChange?.(formattedDate);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (day && newMonth && year) {
      const formattedDate = `${year}-${newMonth}-${day}`;
      onChange?.(formattedDate);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    if (day && month && newYear) {
      const formattedDate = `${newYear}-${month}-${day}`;
      onChange?.(formattedDate);
    }
  };

  return (
    <div id={id} className={cn(`flex gap-2`, className)}>
      {/* Day */}
      <Select
        name={name}
        onValueChange={handleDayChange}
        value={day}
        disabled={disabled}
      >
        <SelectTrigger className="w-32 bg-[#09090B] rounded-xl border">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select
        onValueChange={handleMonthChange}
        value={month}
        disabled={disabled}
      >
        <SelectTrigger className="w-32 h-[64px] bg-[#09090B] rounded-xl border">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select onValueChange={handleYearChange} value={year} disabled={disabled}>
        <SelectTrigger className="w-56 h-[64px] bg-[#09090B] rounded-xl border">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
