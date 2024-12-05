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
    <div className="flex flex-wrap gap-4">
      {/* Teaching Hours */}
      <div className="flex items-center">
        <label className="block mr-2">
          Enter teaching hours:
          <input
            type="number"
            step="0.01" // Allow two decimal places
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
            className="ml-2 border p-1"
            style={{ width: "60px" }}
          />
        </label>
        <button
          onClick={handleAutoFillLessonHours}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Auto-Fill Teaching Hours
        </button>
      </div>

      {/* Break Time */}
      <div className="flex items-center">
        <label className="block mr-2">
          Enter default break time:
          <input
            type="number"
            step="0.1" // Allow one decimal place
            value={breakTimeDefault}
            onChange={(e) => onBreakTimeDefaultChange(e.target.value)}
            onBlur={() => {
              const parsedValue = parseFloat(breakTimeDefault);
              if (!isNaN(parsedValue)) {
                onBreakTimeDefaultChange(parsedValue.toFixed(1));
              } else {
                onBreakTimeDefaultChange("1.0"); // Reset to default if invalid input
              }
            }}
            className="ml-2 border p-1"
            style={{ width: "60px" }}
          />
        </label>
        <button
          onClick={handleAutoFillBreakTime}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Auto-Fill Break Time
        </button>
      </div>
    </div>
  );
};

export default AutoFillControls;
