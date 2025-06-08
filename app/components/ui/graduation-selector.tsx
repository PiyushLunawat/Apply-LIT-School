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

interface GraduationSelectorProps {
  value?: string; // Expected format: "YYYY-MM" or "YYYY-MM-DD"
  onChange?: (date: string) => void;
  disabled?: boolean;
  maxDate?: string; // Expected format: "YYYY-MM-DD"
  minDate?: string; // Expected format: "YYYY-MM-DD"
  id?: string;
  className?: string;
  name?: string;
}

export default function GraduationSelector({
  value,
  onChange,
  disabled,
  maxDate,
  minDate,
  id,
  className,
  name,
}: GraduationSelectorProps) {
  const parseDate = (dateString?: string) => {
    if (!dateString) return { month: "", year: "" };
    const parts = dateString.split("-");
    const year = parts[0] || "";
    const month = parts[1] || "";
    return { month, year };
  };

  const { month: initialMonth, year: initialYear } = parseDate(value);

  const [month, setMonth] = React.useState<string>(initialMonth);
  const [year, setYear] = React.useState<string>(initialYear);

  React.useEffect(() => {
    const { month: newMonth, year: newYear } = parseDate(value);
    setMonth(newMonth);
    setYear(newYear);
  }, [value]);

  const getDateConstraints = () => {
    const currentYear = new Date().getFullYear();
    const maxYear = maxDate
      ? Number.parseInt(maxDate.split("-")[0])
      : currentYear;
    const minYear = minDate
      ? Number.parseInt(minDate.split("-")[0])
      : currentYear - 50;
    return { maxYear, minYear };
  };

  const { maxYear, minYear } = getDateConstraints();

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

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    (maxYear - i).toString()
  );

  const isDateValid = (m: string, y: string) => {
    if (!m || !y) return true;
    const dateStr = `${y}-${m}-01`; // Use first day of month for validation
    if (maxDate && dateStr > maxDate) return false;
    if (minDate && dateStr < minDate) return false;
    return true;
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (newMonth && year && isDateValid(newMonth, year)) {
      // Return format: YYYY-MM-DD (with day as 01)
      const formattedDate = `${year}-${newMonth}-01`;
      onChange?.(formattedDate);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    if (month && newYear && isDateValid(month, newYear)) {
      // Return format: YYYY-MM-DD (with day as 01)
      const formattedDate = `${newYear}-${month}-01`;
      onChange?.(formattedDate);
    }
  };

  return (
    <div id={id} className={cn("flex gap-2", className)}>
      {/* Month (Name) */}
      <Select
        onValueChange={handleMonthChange}
        value={month}
        disabled={disabled}
      >
        <SelectTrigger className="w-40 flex-1">
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

      {/* Year */}
      <Select
        name={name}
        onValueChange={handleYearChange}
        value={year}
        disabled={disabled}
      >
        <SelectTrigger className="w-24 flex-1">
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
