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
  return (
    <div className="flex flex-col gap-4 mb-4">
      <select
        value={month ?? ""}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          onMonthChange(value);
        }}
        className="..."
        disabled={disabled}
      >
        <option value="">Select Month</option>
        {[
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].map((month, index) => (
          <option key={index} value={index + 1}>
            {month}
          </option>
        ))}
      </select>

      <select
        value={year ?? ""}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : null;
          onYearChange(value);
        }}
        className="w-full p-1 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] cursor-pointer text-sm sm:text-base"
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
