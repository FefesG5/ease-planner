interface AutoFillControlsProps {
  lessonHours: string;
  breakTimeDefault: string;
  onLessonHoursChange: (value: string) => void;
  onBreakTimeDefaultChange: (value: string) => void;
  handleAutoFillLessonHours: () => void;
  handleAutoFillBreakTime: () => void;
}

const AutoFillControls: React.FC<AutoFillControlsProps> = ({
  lessonHours,
  breakTimeDefault,
  onLessonHoursChange,
  onBreakTimeDefaultChange,
  handleAutoFillLessonHours,
  handleAutoFillBreakTime,
}) => {
  return (
    <div
      className="flex flex-col gap-4 items-start w-full max-w-[600px] mx-auto p-4"
      style={{
        backgroundColor: "var(--user-section-bg-color)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Teaching Hours */}
      <div className="flex items-center justify-between w-full">
        <label
          className="text-xs font-medium"
          style={{
            color: "var(--body-text-color)", // Use the global text color variable
          }}
        >
          Lesson Hours:
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            value={lessonHours}
            onChange={(e) => onLessonHoursChange(e.target.value)}
            onBlur={() => {
              const parsedValue = parseFloat(lessonHours);
              if (!isNaN(parsedValue)) {
                onLessonHoursChange(parsedValue.toFixed(2));
              } else {
                onLessonHoursChange("");
              }
            }}
            className="border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-400 w-[70px]"
            style={{
              backgroundColor: "var(--signin-input-bg-color)", // Use input background color
            }}
          />
          <button
            onClick={handleAutoFillLessonHours}
            className="bg-blue-500 text-white px-3 py-1 text-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            Auto-Fill
          </button>
        </div>
      </div>

      {/* Break Time */}
      <div className="flex items-center justify-between w-full">
        <label
          className="text-xs font-medium"
          style={{
            color: "var(--body-text-color)", // Use the global text color variable
          }}
        >
          Break Time:
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.1"
            value={breakTimeDefault}
            onChange={(e) => onBreakTimeDefaultChange(e.target.value)}
            onBlur={() => {
              const parsedValue = parseFloat(breakTimeDefault);
              if (!isNaN(parsedValue)) {
                onBreakTimeDefaultChange(parsedValue.toFixed(1));
              } else {
                onBreakTimeDefaultChange("1.0");
              }
            }}
            className="border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-green-200 focus:border-green-400 w-[70px]"
            style={{
              backgroundColor: "var(--signin-input-bg-color)", // Use input background color
            }}
          />
          <button
            onClick={handleAutoFillBreakTime}
            className="bg-green-500 text-white px-3 py-1 text-sm hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
          >
            Auto-Fill
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoFillControls;
