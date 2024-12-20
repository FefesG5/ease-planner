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
  BreakTime: string;
  WorkingHours: string;
  LessonHours: string;
  NonLessonHours: string;
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
  const [localEdits, setLocalEdits] = useState<Record<string, ScheduleRow[]>>(
    {}, // Local state for editable rows
  );

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

  const calculateWorkingHours = (
    startTime: string,
    endTime: string,
    breakTime: string,
  ) => {
    if (
      !startTime ||
      !endTime ||
      !startTime.includes(":") ||
      !endTime.includes(":")
    )
      return "--";
    const [startH, startM] = startTime.split(":".trim()).map(Number);
    const [endH, endM] = endTime.split(":".trim()).map(Number);
    const [breakH, breakM] =
      breakTime && breakTime.includes(":")
        ? breakTime.split(":".trim()).map(Number)
        : [0, 0];

    let workingMinutes =
      endH * 60 + endM - (startH * 60 + startM) - (breakH * 60 + breakM);
    if (workingMinutes <= 0 || isNaN(workingMinutes)) return ""; // Handle invalid time ranges

    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;
    return `${hours}.${minutes.toString().padStart(2, "0")}`;
  };

  const calculateNonLessonHours = (
    workingHours: string,
    lessonHours: string,
  ) => {
    if (
      !workingHours ||
      !lessonHours ||
      !workingHours.includes(".") ||
      !lessonHours.includes(".")
    )
      return "--";
    const [workH, workM] = workingHours.split(".".trim()).map(Number);
    const [lessonH, lessonM] = lessonHours.split(".".trim()).map(Number);

    let nonLessonMinutes = workH * 60 + workM - (lessonH * 60 + lessonM);
    if (nonLessonMinutes < 0 || isNaN(nonLessonMinutes)) return "--";

    const hours = Math.floor(nonLessonMinutes / 60);
    const minutes = nonLessonMinutes % 60;
    return `${hours}.${minutes.toString().padStart(2, "0")}`;
  };

  const generateTableData = (school: string, schedules: FilteredSchedule[]) => {
    if (!schedules.length) return [];

    const selectedSchedule = schedules[0];
    const year = selectedSchedule.year;
    const month = selectedSchedule.month;

    const daysInMonth = new Date(year, month, 0).getDate();
    const existingData = selectedSchedule.schedules.filter(
      (schedule) => schedule.School === school,
    );

    const dateToScheduleMap = new Map(
      existingData.map((row) => [row.Date.replace(/\//g, "-"), row]),
    );

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1;
      const dayKanji =
        fullKanjiDayMap[new Date(year, month - 1, date).getDay()];
      const formattedDate = `${year}-${String(month).padStart(
        2,
        "0",
      )}-${String(date).padStart(2, "0")}`;

      const existingRow = dateToScheduleMap.get(formattedDate);

      const parsedShift = existingRow
        ? {
            StartTime: existingRow.Shift.split("-")[0],
            EndTime: existingRow.Shift.split("-")[1],
          }
        : { StartTime: "", EndTime: "" };

      return {
        Date: date,
        Day: dayKanji,
        StartTime: parsedShift.StartTime || "--:--",
        EndTime: parsedShift.EndTime || "--:--",
        BreakTime: "--", // Default placeholders
        WorkingHours: "--",
        LessonHours: "--",
        NonLessonHours: "--",
      };
    });
  };

  const handleInputChange = (
    school: string,
    rowIndex: number,
    field: keyof ScheduleRow,
    value: string,
  ) => {
    setLocalEdits((prev) => {
      const updatedRows = [...(prev[school] || [])];
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };
      return { ...prev, [school]: updatedRows };
    });
  };

  // Initialize local edits when data is fetched
  if (!Object.keys(localEdits).length && filteredSchedules.length) {
    const initialEdits: Record<string, ScheduleRow[]> = {};
    Object.keys(schoolStates).forEach((school) => {
      initialEdits[school] = generateTableData(school, filteredSchedules);
    });
    setLocalEdits(initialEdits);
  }

  if (isLoading) return <Spinner />;
  if (isError) return <p>Error: {error?.message}</p>;

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
                    colSpan={8}
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
                  <th className="border px-2 py-1">Break Time</th>
                  <th className="border px-2 py-1">Working Hours</th>
                  <th className="border px-2 py-1">Lesson Hours</th>
                  <th className="border px-2 py-1">Non-Lesson Hours</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1">日付</th>
                  <th className="border px-2 py-1">曜日</th>
                  <th className="border px-2 py-1">出社時間</th>
                  <th className="border px-2 py-1">退社時間</th>
                  <th className="border px-2 py-1">休憩時間</th>
                  <th className="border px-2 py-1">労働時間</th>
                  <th className="border px-2 py-1">レッスン時間</th>
                  <th className="border px-2 py-1">レッスン外時間</th>
                </tr>
              </thead>
              <tbody>
                {(localEdits[school] || []).map((row, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-2 py-1">{row.Date}</td>
                    <td className="border px-2 py-1">{row.Day}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={row.StartTime}
                        onChange={(e) =>
                          handleInputChange(
                            school,
                            index,
                            "StartTime",
                            e.target.value,
                          )
                        }
                        placeholder="--:--"
                        className="w-full text-center border"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={row.EndTime}
                        onChange={(e) =>
                          handleInputChange(
                            school,
                            index,
                            "EndTime",
                            e.target.value,
                          )
                        }
                        placeholder="--:--"
                        className="w-full text-center border"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={row.BreakTime}
                        onChange={(e) =>
                          handleInputChange(
                            school,
                            index,
                            "BreakTime",
                            e.target.value,
                          )
                        }
                        placeholder="--"
                        className="w-full text-center border"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      {calculateWorkingHours(
                        row.StartTime,
                        row.EndTime,
                        row.BreakTime,
                      )}
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={row.LessonHours}
                        onChange={(e) =>
                          handleInputChange(
                            school,
                            index,
                            "LessonHours",
                            e.target.value,
                          )
                        }
                        placeholder="--"
                        className="w-full text-center border"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      {calculateNonLessonHours(
                        calculateWorkingHours(
                          row.StartTime,
                          row.EndTime,
                          row.BreakTime,
                        ),
                        row.LessonHours,
                      )}
                    </td>
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
