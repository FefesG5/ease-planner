import React from "react";

interface AvailableSchedule {
  id: string;
  month: number;
  year: number;
  generatedAt: string;
  teacherName: string;
}

interface ScheduleOverviewProps {
  availableSchedules: AvailableSchedule[];
  selectedScheduleId: string | null;
  onSelectSchedule: (id: string) => void;
}

function ScheduleOverview({
  availableSchedules,
  selectedScheduleId,
  onSelectSchedule,
}: ScheduleOverviewProps) {
  return (
    <div className="w-full bg-white border rounded-md shadow-sm">
      {/* Header */}
      <h2 className="text-sm font-bold px-3 py-2 border-b text-gray-800 tracking-wide uppercase">
        Available Schedules
      </h2>

      {/* Schedule List */}
      <ul className="space-y-1 overflow-y-auto max-h-[300px]">
        {availableSchedules.length > 0 ? (
          availableSchedules.map((schedule) => (
            <li
              key={schedule.id}
              className={`p-3 border cursor-pointer flex justify-between items-center rounded-md transition-all duration-200 ${
                selectedScheduleId === schedule.id
                  ? "bg-blue-100 border-blue-400"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => onSelectSchedule(schedule.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg text-gray-800">📅</span>
                <div className="text-xs">
                  <p className="font-semibold text-gray-800">
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
