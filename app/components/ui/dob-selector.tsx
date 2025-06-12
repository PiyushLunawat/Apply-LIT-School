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

interface DOBSelectorProps {
  value?: string; // Expected format: "YYYY-MM-DD"
  onChange?: (date: string) => void;
  disabled?: boolean;
  maxDate?: string; // Expected format: "YYYY-MM-DD"
  minDate?: string; // Expected format: "YYYY-MM-DD"
  id?: string;
  className?: string;
  name?: string;
}

export default function DOBSelector({
  value,
  onChange,
  disabled,
  maxDate,
  minDate,
  id,
  className,
  name,
}: DOBSelectorProps) {
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

  React.useEffect(() => {
    const { day: newDay, month: newMonth, year: newYear } = parseDate(value);
    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);
  }, [value]);

  const getDaysInMonth = (monthStr: string, yearStr: string) => {
    if (!monthStr || !yearStr) return 31;
    const monthNum = Number.parseInt(monthStr);
    const yearNum = Number.parseInt(yearStr);
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const getDateConstraints = () => {
    const currentYear = new Date().getFullYear();
    const maxYear = maxDate
      ? Number.parseInt(maxDate.split("-")[0])
      : currentYear;
    const minYear = minDate
      ? Number.parseInt(minDate.split("-")[0])
      : currentYear - 100;
    return { maxYear, minYear };
  };

  const { maxYear, minYear } = getDateConstraints();

  const daysInCurrentMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  // Month numbers (01-12)
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    (maxYear - i).toString()
  );

  const isDateValid = (d: string, m: string, y: string) => {
    if (!d || !m || !y) return true;
    const dateStr = `${y}-${m}-${d}`;
    const date = new Date(dateStr);
    if (date.toISOString().split("T")[0] !== dateStr) return false;
    if (maxDate && dateStr > maxDate) return false;
    if (minDate && dateStr < minDate) return false;
    return true;
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    if (newDay && month && year && isDateValid(newDay, month, year)) {
      const formattedDate = `${year}-${month}-${newDay}`;
      onChange?.(formattedDate);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    const maxDaysInNewMonth = getDaysInMonth(newMonth, year);
    const adjustedDay =
      day && Number.parseInt(day) > maxDaysInNewMonth
        ? maxDaysInNewMonth.toString().padStart(2, "0")
        : day;

    if (adjustedDay !== day) {
      setDay(adjustedDay);
    }

    if (
      adjustedDay &&
      newMonth &&
      year &&
      isDateValid(adjustedDay, newMonth, year)
    ) {
      const formattedDate = `${year}-${newMonth}-${adjustedDay}`;
      onChange?.(formattedDate);
    }
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    const maxDaysInMonth = getDaysInMonth(month, newYear);
    const adjustedDay =
      day && Number.parseInt(day) > maxDaysInMonth
        ? maxDaysInMonth.toString().padStart(2, "0")
        : day;

    if (adjustedDay !== day) {
      setDay(adjustedDay);
    }

    if (
      adjustedDay &&
      month &&
      newYear &&
      isDateValid(adjustedDay, month, newYear)
    ) {
      const formattedDate = `${newYear}-${month}-${adjustedDay}`;
      onChange?.(formattedDate);
    }
  };

  return (
    <div id={id} className={cn("flex gap-2", className)}>
      {/* Day (DD) */}
      <Select
        name={name}
        onValueChange={handleDayChange}
        value={day}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${
            day ? "text-white" : "text-muted-foreground"
          } w-14 flex-1`}
        >
          <SelectValue placeholder="DD" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month (MM) */}
      <Select
        onValueChange={handleMonthChange}
        value={month}
        disabled={disabled}
      >
        <SelectTrigger
          className={`${
            month ? "text-white" : "text-muted-foreground"
          } w-14 flex-1`}
        >
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year (YYYY) */}
      <Select onValueChange={handleYearChange} value={year} disabled={disabled}>
        <SelectTrigger
          className={`${
            year ? "text-white" : "text-muted-foreground"
          } w-32 flex-1`}
        >
          <SelectValue placeholder="YYYY" />
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
