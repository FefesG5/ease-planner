import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Spinner from "@/components/Spinner/Spinner";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  FilteredSchedule,
  ScheduleRow,
} from "@/utils/helpfulFunctions/tableDataUtils";
import { generateTableData } from "@/utils/helpfulFunctions/tableDataUtils";
import {
  calculateTotalWorkingHours,
  calculateNonLessonHours,
} from "@/utils/helpfulFunctions/timeCalculations";

function TestingPage() {
  const { user } = useAuthContext();
  const [schoolStates, setSchoolStates] = useState<Record<string, boolean>>({
    M: true,
    T: false,
    Future: false,
  }); // Track collapsed state for each school
  const [localEdits, setLocalEdits] = useState<Record<string, ScheduleRow[]>>(
    {},
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

  // Initialize local edits when data is fetched
  if (!Object.keys(localEdits).length && filteredSchedules.length) {
    const initialEdits: Record<string, ScheduleRow[]> = {};
    Object.keys(schoolStates).forEach((school) => {
      initialEdits[school] = generateTableData(
        school,
        filteredSchedules,
        fullKanjiDayMap,
      );
    });
    setLocalEdits(initialEdits);
  }

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

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-sm text-red-600">{error?.message}</p>;

  return (
    <div className="">
      <h1 className="text-base font-bold mb-2">Available Schedule List</h1>

      {/* Collapsible Tables */}
      {Object.keys(schoolStates).map((school) => (
        <div key={school} className="mb-2">
          <button
            onClick={() =>
              setSchoolStates((prev) => ({
                ...prev,
                [school]: !prev[school],
              }))
            }
            className="w-full text-left bg-gray-300 px-2 py-1 font-medium border-b text-sm"
          >
            {schoolStates[school] ? "▼" : "►"} School {school}
          </button>
          {schoolStates[school] && (
            <table
              className="w-full border-collapse border text-xs bg-white"
              style={{
                fontFamily:
                  '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Meiryo", sans-serif',
              }}
            >
              <thead>
                <tr className="bg-gray-200">
                  <th
                    colSpan={10}
                    className="border px-1 py-1 text-center text-sm font-normal"
                  >
                    Schedule Table (出勤簿) - School {school}
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Date</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/date-icon.svg"
                        alt="date Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Day</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/day-icon.svg"
                        alt="Day Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Start Time</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/starting-time-icon.svg"
                        alt="Starting Time Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">End Time</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/finishing-time-icon.svg"
                        alt="Finishing Time Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell">
                    <span className="hidden sm:inline">Overtime</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/overtime-icon.svg"
                        alt="Overtime Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Break Time</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/break-time-icon.svg"
                        alt="Breaktime Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Working Hours</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/working-hours-icon.svg"
                        alt="Working Hours Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Lesson Hours</span>
                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/lesson-hours-icon.svg"
                        alt="Lesson Hours Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    <span className="hidden sm:inline">Non-Lesson Hours</span>
                    <div className="sm:hidden mx-auto h-5 w-6 relative">
                      <Image
                        src="/non-lesson-hours-icon.svg"
                        alt="Non Lesson Hours Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell">
                    <span className="hidden sm:inline">Approval</span>

                    <div className="sm:hidden mx-auto h-5 w-5 relative">
                      <Image
                        src="/approved-icon.svg"
                        alt="Approved Icon"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </th>
                </tr>
                <tr className="bg-gray-50 sm:table-row hidden">
                  <th className="border px-0.5 py-0.5 font-normal">日付</th>
                  <th className="border px-0.5 py-0.5 font-normal">曜日</th>
                  <th className="border px-0.5 py-0.5 font-normal">出社時間</th>
                  <th className="border px-0.5 py-0.5 font-normal">退社時間</th>
                  <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell">
                    残業時間
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">休憩時間</th>
                  <th className="border px-0.5 py-0.5 font-normal">労働時間</th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    レッスン時間
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal">
                    レッスン外時間
                  </th>
                  <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell">
                    承認
                  </th>
                </tr>
              </thead>
              <tbody>
                {(localEdits[school] || []).map((row, index) => (
                  <tr key={index} className="text-center">
                    <td className="border px-0.5 py-0.5">{row.Date}</td>
                    <td className="border px-0.5 py-0.5">{row.Day}</td>
                    <td className="border px-0.5 py-0.5">
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
                        className="w-full text-center border text-xs"
                      />
                    </td>
                    <td className="border px-0.5 py-0.5">
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
                        className="w-full text-center border text-xs"
                      />
                    </td>
                    <td className="border px-0.5 py-0.5 hidden sm:table-cell">
                      {row.Overtime}
                    </td>
                    <td className="border px-0.5 py-0.5">
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
                        className="w-full text-center border text-xs"
                      />
                    </td>
                    <td className="border px-0.5 py-0.5">
                      {calculateTotalWorkingHours(
                        row.StartTime,
                        row.EndTime,
                        row.BreakTime,
                      )}
                    </td>
                    <td className="border px-0.5 py-0.5">
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
                        className="w-full text-center border text-xs"
                      />
                    </td>
                    <td className="border px-0.5 py-0.5">
                      {calculateNonLessonHours(
                        calculateTotalWorkingHours(
                          row.StartTime,
                          row.EndTime,
                          row.BreakTime,
                        ),
                        row.LessonHours,
                      )}
                    </td>
                    <td className="border px-0.5 py-0.5 hidden sm:table-cell">
                      {row.Approval}
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
