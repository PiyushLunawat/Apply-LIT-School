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

interface DurationSelectorProps {
  value?: string; // Expected format: "YYYY-MM" or "YYYY-MM-DD"
  onChange?: (date: string) => void;
  disabled?: boolean;
  maxDate?: string; // Format: YYYY-MM-DD
  minDate?: string;
  id?: string;
  className?: string;
  name?: string;
}

export default function DurationSelector({
  value,
  onChange,
  disabled,
  maxDate,
  minDate,
  id,
  className,
  name,
}: DurationSelectorProps) {
  const parseDate = (dateString?: string) => {
    if (!dateString) return { month: "", year: "" };
    const [year, month] = dateString.split("-");
    return { year: year || "", month: month || "" };
  };

  const { year: initialYear, month: initialMonth } = parseDate(value);

  const [year, setYear] = React.useState<string>(initialYear);
  const [month, setMonth] = React.useState<string>(initialMonth);

  React.useEffect(() => {
    const { year, month } = parseDate(value);
    setYear(year);
    setMonth(month);
  }, [value]);

  const currentYear = new Date().getFullYear();
  const maxY = maxDate ? Number(maxDate.split("-")[0]) : currentYear;
  const minY = minDate ? Number(minDate.split("-")[0]) : currentYear - 30;
  const years = Array.from(
    { length: maxY - minY + 1 },
    (_, i) => `${maxY - i}`
  );

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const isValidDate = (y: string, m: string) => {
    if (!y || !m) return false;
    const fullDate = `${y}-${m}-01`;
    if (maxDate && fullDate > maxDate) return false;
    return !(minDate && fullDate < minDate);
  };

  const emitChange = (newMonth: string, newYear: string) => {
    if (isValidDate(newYear, newMonth)) {
      onChange?.(`${newYear}-${newMonth}-01`);
    }
  };

  return (
    <div id={id} className={cn("flex gap-2", className)}>
      <Select
        disabled={disabled}
        value={month}
        onValueChange={(newMonth) => {
          setMonth(newMonth);
          emitChange(newMonth, year);
        }}
      >
        <SelectTrigger
          className={`${
            month ? "text-white" : "text-muted-foreground"
          } w-40 flex-1`}
        >
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        name={name}
        disabled={disabled}
        value={year}
        onValueChange={(newYear) => {
          setYear(newYear);
          emitChange(month, newYear);
        }}
      >
        <SelectTrigger
          className={`${
            year ? "text-white" : "text-muted-foreground"
          } w-24 flex-1`}
        >
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
