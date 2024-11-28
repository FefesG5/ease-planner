function ScheduleOverview() {
  const availableSchedules = [
    {
      generatedAt: "2024-11-22T05:56:43.615Z",
      month: "November",
      year: 2024,
      id: "schedule-1",
    },
    {
      generatedAt: "2024-10-15T08:45:30.123Z",
      month: "October",
      year: 2024,
      id: "schedule-2",
    },
  ];

  const handleScheduleSelect = (scheduleId: string) => {
    console.log("Selected Schedule ID:", scheduleId);
  };

  return (
    <div className="w-full bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)] rounded-md shadow-sm">
      {/* Header */}
      <h2 className="text-sm font-bold px-3 py-2 border-b-[1px] border-[var(--sidebar-border-color)] text-[color:var(--body-text-color)] tracking-wide uppercase">
        Available Schedules
      </h2>

      {/* Schedule List */}
      <ul className="space-y-1 overflow-y-auto max-h-[300px]">
        {availableSchedules.map((schedule) => (
          <li
            key={schedule.id}
            className="p-3 border shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center bg-[var(--schedule-list-bg-color)] border-[var(--sidebar-border-color)] hover:bg-[var(--schedule-item-hover-bg-color)] transition-all duration-200 ease-in-out"
          >
            <div
              className="flex items-center space-x-2"
              onClick={() => handleScheduleSelect(schedule.id)}
            >
              <span className="text-lg text-[color:var(--body-text-color)]">
                📅
              </span>
              <div className="text-xs">
                <p className="font-semibold text-[color:var(--body-text-color)]">
                  {schedule.month} {schedule.year}
                </p>
                <p className="italic text-gray-500">
                  Generated:{" "}
                  {new Date(schedule.generatedAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-500 hover:underline">
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleOverview;
