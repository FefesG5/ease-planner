import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Spinner from "@/components/Spinner/Spinner";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  FilteredSchedule,
  ScheduleRow,
} from "@/utils/helpfulFunctions/tableDataUtils";
import { generateTableData } from "@/utils/helpfulFunctions/tableDataUtils";
import {
  calculateTotalWorkingHours,
  calculateNonLessonHours,
  calculateOvertime,
} from "@/utils/helpfulFunctions/timeCalculations";
import { generateSchedulePDF } from "@/utils/helpfulFunctions/pdfGeneratorUtils";
import jsPDF from "jspdf";

function Edit() {
  const { user } = useAuthContext();
  const [selectedSchedule, setSelectedSchedule] =
    useState<FilteredSchedule | null>(null);

  const [schoolStates, setSchoolStates] = useState<Record<string, boolean>>({
    M: true,
    T: false,
    Future: false,
  }); // Track collapsed state for each school
  const [localEdits, setLocalEdits] = useState<Record<string, ScheduleRow[]>>(
    {},
  );
  const [breakTimeValue, setBreakTimeValue] = useState<string>("0.0");
  const [lessonHoursValue, setLessonHoursValue] = useState<string>("0.0");
  const [teacherName, setTeacherName] = useState<string>("");

  const {
    data: filteredSchedules = [],
    isLoading,
    isError,
    error,
  } = useQuery<FilteredSchedule[]>({
    queryKey: ["filteredSchedules", user?.uid],
    queryFn: async () => {
      if (!user) return [];
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
    enabled: !!user, // 🚀 Prevents fetch until user is ready
    staleTime: 10 * 60 * 1000, // 🚀 Cache schedules for 10 minutes
  });

  useEffect(() => {
    const fullKanjiDayMap = [
      "日曜日",
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
    ];

    if (selectedSchedule) {
      const scheduleData = filteredSchedules.find(
        (schedule) => schedule.id === selectedSchedule.id,
      );
      if (scheduleData) {
        const initialEdits: Record<string, ScheduleRow[]> = {};

        // Even though we use schoolStates below...
        Object.keys(schoolStates).forEach((school) => {
          initialEdits[school] = generateTableData(
            school,
            [scheduleData],
            fullKanjiDayMap,
          );
        });

        setLocalEdits(initialEdits);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchedule, filteredSchedules]);

  const handleInputChange = (
    school: string,
    rowIndex: number,
    field: keyof ScheduleRow,
    value: string,
  ) => {
    setLocalEdits((prev) => {
      const updatedRows = [...(prev[school] || [])];

      // Update the specific field
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };

      // Recalculate derived fields
      const { StartTime, EndTime, BreakTime, LessonHours } =
        updatedRows[rowIndex];
      const newWorkingHours = calculateTotalWorkingHours(
        StartTime,
        EndTime,
        BreakTime,
      );
      const newNonLessonHours = calculateNonLessonHours(
        newWorkingHours,
        LessonHours,
      );
      const newOvertime = calculateOvertime(StartTime, EndTime, BreakTime);

      // Save calculations to local state
      updatedRows[rowIndex].WorkingHours = newWorkingHours;
      updatedRows[rowIndex].NonLessonHours = newNonLessonHours;
      updatedRows[rowIndex].Overtime = newOvertime;

      return { ...prev, [school]: updatedRows };
    });
  };

  const autofillColumn = (
    school: string,
    field: keyof ScheduleRow,
    defaultValue: string,
  ) => {
    setLocalEdits((prev) => {
      const updatedRows = (prev[school] || []).map((row) => {
        const isValidTime = (time: string) => {
          const timeParts = time.split(":");
          return (
            timeParts.length === 2 &&
            !isNaN(Number(timeParts[0])) &&
            !isNaN(Number(timeParts[1])) &&
            Number(timeParts[0]) >= 0 &&
            Number(timeParts[0]) < 24 &&
            Number(timeParts[1]) >= 0 &&
            Number(timeParts[1]) < 60
          );
        };

        // Ensure StartTime and EndTime are valid before applying autofill
        if (isValidTime(row.StartTime) && isValidTime(row.EndTime)) {
          // Apply autofill to the specified field
          const updatedRow = { ...row, [field]: defaultValue };

          // Recalculate derived fields
          const { StartTime, EndTime, BreakTime, LessonHours } = updatedRow;
          const newWorkingHours = calculateTotalWorkingHours(
            StartTime,
            EndTime,
            BreakTime,
          );
          const newNonLessonHours = calculateNonLessonHours(
            newWorkingHours,
            LessonHours,
          );
          const newOvertime = calculateOvertime(StartTime, EndTime, BreakTime);

          // Save calculations to the row
          updatedRow.WorkingHours = newWorkingHours;
          updatedRow.NonLessonHours = newNonLessonHours;
          updatedRow.Overtime = newOvertime; // Added overtime recalculation

          return updatedRow;
        }

        // If validation fails, return the row unchanged
        return row;
      });

      return { ...prev, [school]: updatedRows };
    });
  };

  const handleGeneratePDF = (): void => {
    if (!selectedSchedule) {
      alert("Please select a schedule first!");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    // Generate the combined PDF for all schools
    Object.keys(localEdits).forEach((school, index) => {
      const schoolData = localEdits[school] || [];
      const schoolNameMap: Record<string, string> = {
        M: "TryAngle Kids 南草津校",
        T: "TryAngle Kids 高槻校",
        Future: "KZ校",
      };
      const schoolName = schoolNameMap[school] || school;

      if (index > 0) {
        doc.addPage();
      }

      generateSchedulePDF(
        schoolName, // Pass the correct school name
        schoolData, // Use localEdits data for the table
        `${selectedSchedule.year}-${selectedSchedule.month}`, // Month-Year
        teacherName.trim() || selectedSchedule.teacherName, // Prioritize edited name
        doc, // PDF instance
      );
    });

    // Save the combined PDF
    doc.save(`Schedule_${selectedSchedule.year}-${selectedSchedule.month}.pdf`);
  };

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-sm text-red-600">{error?.message}</p>;

  return (
    <div className="mt-0">
      {/* Schedule Selector */}
      <div className="schedule-selector p-4 bg-[var(--user-section-bg-color)]">
        <h1 className="text-base font-bold text-center mb-1">
          AVAILABLE SCHEDULE LIST
        </h1>
        {/* Schedule Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4">
          <label htmlFor="scheduleSelect" className="text-sm font-medium">
            Select Schedule
          </label>
          <select
            id="scheduleSelect"
            value={selectedSchedule?.id || ""}
            onChange={(e) =>
              setSelectedSchedule(
                filteredSchedules.find(
                  (schedule) => schedule.id === e.target.value,
                ) || null,
              )
            }
            className="border px-2 py-1 text-sm bg-[var(--signin-input-bg-color)] mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto"
          >
            <option value="" disabled>
              -- Select a Schedule --
            </option>
            {filteredSchedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {`${schedule.teacherName} - Schedule ${schedule.year}-${schedule.month}`}
              </option>
            ))}
          </select>
        </div>

        {/* Teacher Name Input & Download Button */}
        {selectedSchedule && (
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="teacherNameInput" className="text-sm font-medium">
              Edit Teacher Name
            </label>
            <input
              id="teacherNameInput"
              type="text"
              value={teacherName || selectedSchedule.teacherName || ""}
              onChange={(e) => setTeacherName(e.target.value)}
              className="border px-2 py-1 text-sm mt-2 sm:mt-0 sm:ml-2 w-full sm:w-60 bg-[var(--signin-input-bg-color)]"
            />
            <button
              onClick={handleGeneratePDF}
              className="mt-3 sm:mt-0 sm:ml-4 px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-full shadow-md hover:bg-green-700 transition"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Tables */}
      {selectedSchedule ? (
        Object.keys(schoolStates).map((school) => (
          <div key={school}>
            <button
              onClick={() =>
                setSchoolStates((prev) => ({
                  ...prev,
                  [school]: !prev[school],
                }))
              }
              className="w-full text-left px-2 py-1 font-medium text-lg bg-[var(--schedule-list-bg-color)] border border-gray-100"
            >
              {schoolStates[school] ? "▼" : "►"} School {school}
            </button>

            {schoolStates[school] && (
              <>
                {/* Autofill Controls */}
                <div className="p-2 shadow-sm bg-[var(--signin-container-bg-color)]">
                  <div className="flex flex-wrap items-center justify-end gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Break Time</label>
                      <input
                        type="text"
                        value={breakTimeValue}
                        onChange={(e) => setBreakTimeValue(e.target.value)}
                        className="border px-2 py-1 text-sm w-20 bg-[var(--signin-input-bg-color)]"
                      />
                      <button
                        onClick={() =>
                          autofillColumn(school, "BreakTime", breakTimeValue)
                        }
                        className="px-4 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600 shadow-sm"
                      >
                        Autofill
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">
                        Lesson Hours
                      </label>
                      <input
                        type="text"
                        value={lessonHoursValue}
                        onChange={(e) => setLessonHoursValue(e.target.value)}
                        className="border px-2 py-1 text-sm w-20 bg-[var(--signin-input-bg-color)]"
                      />
                      <button
                        onClick={() =>
                          autofillColumn(
                            school,
                            "LessonHours",
                            lessonHoursValue,
                          )
                        }
                        className="px-4 py-1 bg-green-500 text-white text-sm hover:bg-green-600 shadow-sm"
                      >
                        Autofill
                      </button>
                    </div>
                  </div>
                </div>
                {/* Table Wrapper for overflow */}
                <div className="overflow-x-auto">
                  <table
                    className="w-full border-collapse border text-xs text-[var(--body-text-color)] bg-[var(--signin-input-bg-color)]"
                    style={{
                      fontFamily:
                        '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Meiryo", sans-serif',
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          colSpan={10}
                          className="border px-1 py-1 text-center text-sm font-normal"
                        >
                          Schedule Table (出勤簿)
                        </th>
                      </tr>
                      {/* Consolidated Header Row */}
                      <tr>
                        {[
                          { label: "Date", icon: "/date-icon.svg" },
                          { label: "Day", icon: "/day-icon.svg" },
                          {
                            label: "Start Time",
                            icon: "/starting-time-icon.svg",
                          },
                          {
                            label: "End Time",
                            icon: "/finishing-time-icon.svg",
                          },
                          { label: "Overtime", icon: "/overtime-icon.svg" },
                          { label: "Break Time", icon: "/break-time-icon.svg" },
                          {
                            label: "Working Hours",
                            icon: "/working-hours-icon.svg",
                          },
                          {
                            label: "Lesson Hours",
                            icon: "/lesson-hours-icon.svg",
                          },
                          {
                            label: "Non-Lesson Hours",
                            icon: "/non-lesson-hours-icon.svg",
                          },
                          {
                            label: "Approval",
                            icon: "/approved-icon.svg",
                            hideOnMobile: true,
                          },
                        ].map((header, idx) => (
                          <th
                            key={idx}
                            className={`border px-0.5 py-0.5 font-normal ${
                              header.hideOnMobile
                                ? "hidden sm:table-cell"
                                : "w-auto"
                            }`}
                          >
                            <span className="hidden sm:inline">
                              {header.label}
                            </span>
                            <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                              <Image
                                src={header.icon}
                                alt={`${header.label} Icon`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </th>
                        ))}
                      </tr>
                      {/* Japanese Header Row for Desktop */}
                      <tr className="hidden sm:table-row">
                        {[
                          "日付",
                          "曜日",
                          "出社時間",
                          "退社時間",
                          "残業時間",
                          "休憩時間",
                          "労働時間",
                          "レッスン時間",
                          "レッスン外時間",
                          "承認",
                        ].map((jp, idx) => (
                          <th
                            key={idx}
                            className="border px-0.5 py-0.5 font-normal"
                          >
                            {jp}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(localEdits[school] || []).map((row, index) => (
                        <tr key={index} className="text-center">
                          <td className="border px-0.5 py-0.5">{row.Date}</td>
                          <td className="border px-0.5 py-0.5">
                            <span className="hidden sm:inline">{row.Day}</span>
                            <span className="sm:hidden">
                              {row.Day.charAt(0)}
                            </span>
                          </td>
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
                              className="w-full h-full text-center text-xs bg-transparent border-none outline-none"
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
                              className="w-full h-full text-center text-xs bg-transparent border-none outline-none"
                            />
                          </td>
                          <td className="border px-0.5 py-0.5 w-[34px] text-xs">
                            {row.Overtime}
                          </td>
                          <td className="border px-0.5 py-0.5 w-[34px] text-xs">
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
                              placeholder=""
                              className="w-full h-full text-center text-xs bg-transparent border-none outline-none"
                            />
                          </td>
                          <td className="border px-0.5 py-0.5 w-[34px] text-xs">
                            {calculateTotalWorkingHours(
                              row.StartTime,
                              row.EndTime,
                              row.BreakTime,
                            )}
                          </td>
                          <td className="border px-0.5 py-0.5 w-[34px] text-xs">
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
                              placeholder=""
                              className="w-full h-full text-center text-xs bg-transparent border-none outline-none"
                            />
                          </td>
                          <td className="border text-center text-xs w-[34px]">
                            <span className="w-full text-xs">
                              {calculateNonLessonHours(
                                calculateTotalWorkingHours(
                                  row.StartTime,
                                  row.EndTime,
                                  row.BreakTime,
                                ),
                                row.LessonHours,
                              )}
                            </span>
                          </td>
                          <td className="border px-0.5 py-0.5 hidden sm:table-cell">
                            {row.Approval}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-center mt-4">
          Please select a schedule to view its details.
        </p>
      )}
    </div>
  );
}

export default withDashboardLayout(Edit);
