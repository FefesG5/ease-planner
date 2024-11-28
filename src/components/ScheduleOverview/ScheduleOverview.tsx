function ScheduleOverview({
  availableSchedules,
}: {
  availableSchedules: Array<{
    id: string;
    month: string;
    year: number;
    generatedAt: string;
    teacherName: string;
  }>;
}) {
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
        {availableSchedules.length > 0 ? (
          availableSchedules.map((schedule) => (
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
                    {schedule.month} {schedule.year} - {schedule.teacherName}
                  </p>
                  <p className="italic text-gray-500">
                    {new Date(schedule.generatedAt).toLocaleString("en-US", {
                      timeZone: "Asia/Tokyo",
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
          ))
        ) : (
          <p className="text-xs text-center py-2">No schedules available.</p>
        )}
      </ul>
    </div>
  );
}

export default ScheduleOverview;
