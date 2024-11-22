import React, { useState } from "react";

interface DOBPickerProps {
  onChange: (date: Date | null) => void; // Callback to handle the selected date
}

const DOBPicker: React.FC<DOBPickerProps> = ({ onChange }) => {
  const [day, setDay] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");

  // Generate options for day, month, and year
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i); // Last 120 years

  // Update the selected date when all fields are valid
  const handleDateChange = () => {
    if (day && month && year) {
      const selectedDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
      onChange(selectedDate);
    } else {
      onChange(null); // Reset if any value is invalid
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <label className="text-sm font-medium">Date of Birth</label>
      <div className="flex space-x-4">
        {/* Day Dropdown */}
        <select
          value={day}
          onChange={(e) => {
            setDay(Number(e.target.value) || "");
            handleDateChange();
          }}
          className="border rounded-lg p-2 w-20"
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Month Dropdown */}
        <select
          value={month}
          onChange={(e) => {
            setMonth(Number(e.target.value) || "");
            handleDateChange();
          }}
          className="border rounded-lg p-2 w-20"
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={year}
          onChange={(e) => {
            setYear(Number(e.target.value) || "");
            handleDateChange();
          }}
          className="border rounded-lg p-2 w-24"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DOBPicker;
