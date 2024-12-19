import { useQuery } from "@tanstack/react-query";
import Spinner from "@/components/Spinner/Spinner";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";

interface ScheduleRow {
  Date: number; // Date (1, 2, 3...)
  Day: string; // Day in Kanji (日曜日, 月曜日, etc.)
  StartTime: string;
  EndTime: string;
}

interface FilteredSchedule {
  id: string;
  year: number;
  month: number;
  schedules: {
    Date: string; // e.g., "2024-12-01"
    Shift: string; // e.g., "09:00-17:00"
    School: string; // e.g., "M" or "T"
  }[];
}

function TestingPage() {
  const { user } = useAuthContext();
  const [schoolStates, setSchoolStates] = useState<Record<string, boolean>>({
    M: true,
    T: false,
    Future: false,
  }); // Track collapsed state for each school

  const {
    data: filteredSchedules = [],
    isLoading,
    isError,
    error,
  } = useQuery<FilteredSchedule[]>({
    queryKey: ["filteredSchedules"],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/schedules/getFilteredSchedulesByUser?userId=${user.uid}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch schedules");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  const fullKanjiDayMap = [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ];

  const generateTableData = (school: string) => {
    if (!filteredSchedules.length) return [];

    const selectedSchedule = filteredSchedules[0];
    const year = selectedSchedule.year;
    const month = selectedSchedule.month;

    const daysInMonth = new Date(year, month, 0).getDate();
    const existingData = selectedSchedule.schedules.filter(
      (schedule) => schedule.School === school,
    );

    console.log("Filtered schedules for school:", school, existingData);

    // Normalize dates in the fetched data to use dashes
    const dateToScheduleMap = new Map(
      existingData.map((row) => [
        row.Date.replace(/\//g, "-"), // Replace slashes with dashes
        row,
      ]),
    );

    console.log("Normalized date-to-schedule map:", dateToScheduleMap);

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1;
      const dayKanji =
        fullKanjiDayMap[new Date(year, month - 1, date).getDay()];
      const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
        date,
      ).padStart(2, "0")}`;

      console.log("Checking date:", formattedDate);

      const existingRow = dateToScheduleMap.get(formattedDate);

      const parsedShift = existingRow
        ? {
            StartTime: existingRow.Shift.split("-")[0],
            EndTime: existingRow.Shift.split("-")[1],
          }
        : { StartTime: "--:--", EndTime: "--:--" };

      return {
        Date: date,
        Day: dayKanji,
        StartTime: parsedShift.StartTime,
        EndTime: parsedShift.EndTime,
      };
    });
  };

  if (isLoading) return <Spinner />;
  if (isError) return <p>Error: {error?.message}</p>;

  console.log("Fetched Schedules:", filteredSchedules); // Inspect fetched data

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Schedule Table</h1>

      {/* Collapsible Tables */}
      {Object.keys(schoolStates).map((school) => (
        <div key={school} className="mb-4">
          <button
            onClick={() =>
              setSchoolStates((prev) => ({
                ...prev,
                [school]: !prev[school],
              }))
            }
            className="w-full text-left bg-gray-300 px-4 py-2 font-bold border-b"
          >
            {schoolStates[school] ? "▼" : "►"} School {school}
          </button>
          {schoolStates[school] && (
            <table
              className="w-full border-collapse border text-sm"
              style={{
                fontFamily:
                  '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Meiryo", sans-serif',
              }}
            >
              <thead>
                <tr className="bg-gray-200">
                  <th
                    colSpan={4}
                    className="border px-2 py-1 text-center text-lg font-bold"
                  >
                    Schedule Table (出勤簿) - School {school}
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Day</th>
                  <th className="border px-2 py-1">Start Time</th>
                  <th className="border px-2 py-1">End Time</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1">日付</th>
                  <th className="border px-2 py-1">曜日</th>
                  <th className="border px-2 py-1">出社時間</th>
                  <th className="border px-2 py-1">退社時間</th>
                </tr>
              </thead>
              <tbody>
                {generateTableData(school).map((row, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-2 py-1">{row.Date}</td>
                    <td className="border px-2 py-1">{row.Day}</td>
                    <td className="border px-2 py-1">{row.StartTime}</td>
                    <td className="border px-2 py-1">{row.EndTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default withDashboardLayout(TestingPage);
