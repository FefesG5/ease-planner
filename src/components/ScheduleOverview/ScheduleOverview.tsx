function ScheduleOverview() {
  const availableSchedules = [
    {
      generatedAt: "2024-11-22T05:56:43.615Z",
      month: 11,
      year: 2024,
    },
    {
      generatedAt: "2024-11-15T08:45:30.123Z",
      month: 10,
      year: 2024,
    },
  ];

  const months = [
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
  ];

  return (
    <div className="w-full bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)]">
      {/* Header Section */}
      <h2 className="text-sm font-bold px-2 py-2 bg-[var(--schedule-list-bg-color)] border-b-[1px] border-[var(--sidebar-border-color)] text-[color:var(--body-text-color)] tracking-wide uppercase">
        Available Schedules
      </h2>
      {/* List Section */}
      <ul className="divide-y divide-[var(--sidebar-border-color)] max-h-[200px] overflow-y-auto">
        {availableSchedules.map((schedule, index) => (
          <li
            key={index}
            className="flex items-center justify-between px-2 py-2 bg-[var(--user-section-bg-color)] hover:bg-[var(--schedule-item-hover-bg-color)] transition-all duration-150 ease-in-out cursor-pointer"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-[color:var(--body-text-color)]">
                {months[schedule.month - 1]} {schedule.year}
              </p>
              <p className="text-xs text-gray-500">
                Generated:{" "}
                {new Date(schedule.generatedAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className="text-xs font-bold text-blue-500">VIEW</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleOverview;
