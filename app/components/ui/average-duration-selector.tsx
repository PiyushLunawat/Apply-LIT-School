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

interface AverageDurationSelectorProps {
  value?: string; // Expected format: "YYYY-MM" or "YYYY-MM-DD"
  onChange?: (date: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  name?: string;
}

export default function AverageDurationSelector({
  value,
  onChange,
  disabled,
  id,
  className,
  name,
}: AverageDurationSelectorProps) {
  const parseDate = (dateString?: string) => {
    if (!dateString) return { month: "", year: "" };
    const parts = dateString.split("-");
    return { month: parts[1] || "", year: parts[0] || "" };
  };

  const { month: initialMonth, year: initialYear } = parseDate(value);

  const [month, setMonth] = React.useState<string>(initialMonth);
  const [year, setYear] = React.useState<string>(initialYear);

  React.useEffect(() => {
    const { month: newMonth, year: newYear } = parseDate(value);
    setMonth(newMonth);
    setYear(newYear);
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) =>
    (currentYear - i).toString()
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

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (newMonth && year) {
      onChange?.(`${year}-${newMonth}-01`);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    if (month && newYear) {
      onChange?.(`${newYear}-${month}-01`);
    }
  };

  return (
    <div id={id} className={cn("flex gap-2", className)}>
      {/* Month Selector */}
      <Select
        onValueChange={handleMonthChange}
        value={month}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${
            month ? "text-white" : "text-muted-foreground"
          } w-6 flex-1`}
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

      {/* Year Selector */}
      <Select
        name={name}
        onValueChange={handleYearChange}
        value={year}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${
            year ? "text-white" : "text-muted-foreground"
          } w-10 flex-1`}
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
