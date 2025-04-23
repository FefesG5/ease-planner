import { monthNames } from "@/utils/month";

interface MonthYearSelectProps {
  month: number | null;
  year: number | null;
  onMonthChange: (value: number | null) => void;
  onYearChange: (value: number | null) => void;
  disabled?: boolean;
}

const MonthYearSelect: React.FC<MonthYearSelectProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  disabled = false,
}) => {
  const selectClasses =
    "w-full p-2 text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] cursor-pointer text-sm sm:text-base";

  return (
    <div className="flex flex-col gap-4">
      {/* Month Select */}
      <select
        value={month !== null ? month.toString() : ""}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          onMonthChange(value);
        }}
        className={selectClasses}
        disabled={disabled}
      >
        <option value="">Select Month</option>
        {monthNames.map((monthName, index) => (
          <option key={index} value={index + 1}>
            {monthName}
          </option>
        ))}
      </select>

      {/* Year Select */}
      <select
        value={year !== null ? year.toString() : ""}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          onYearChange(value);
        }}
        className={selectClasses}
        disabled={disabled}
      >
        <option value="">Select Year</option>
        {[2024, 2025].map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthYearSelect;
