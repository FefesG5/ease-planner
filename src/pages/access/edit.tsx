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

      // Save calculations to local state
      updatedRows[rowIndex].WorkingHours = newWorkingHours;
      updatedRows[rowIndex].NonLessonHours = newNonLessonHours;

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

          // Save calculations to the row
          updatedRow.WorkingHours = newWorkingHours;
          updatedRow.NonLessonHours = newNonLessonHours;

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
    <div className="">
      {/* Schedule Selector */}
      <div className="schedule-selector p-2 bg-[var(--user-section-bg-color)]">
        <h1 className="text-base font-bold">Available Schedule List</h1>
        <label htmlFor="scheduleSelect" className="text-sm font-medium ">
          Select Schedule:
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
          className="border px-2 py-1 text-sm bg-[var(--signin-input-bg-color)]"
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
        {selectedSchedule && (
          <div className="">
            <label htmlFor="teacherNameInput" className="text-sm font-medium">
              Edit Teacher Name:
            </label>
            <input
              id="teacherNameInput"
              type="text"
              value={teacherName || selectedSchedule.teacherName || ""}
              onChange={(e) => setTeacherName(e.target.value)}
              className="border px-2 py-1 text-sm w-60 bg-[var(--signin-input-bg-color)]"
            />
          </div>
        )}
      </div>

      {/* Collapsible Tables */}
      {selectedSchedule ? (
        Object.keys(schoolStates).map((school) => (
          <div key={school} className="">
            <button
              onClick={() =>
                setSchoolStates((prev) => ({
                  ...prev,
                  [school]: !prev[school],
                }))
              }
              className="w-full text-left px-2 py-1 font-medium border-b text-lg bg-[var(--signin-input-bg-color)]"
            >
              {schoolStates[school] ? "▼" : "►"} School {school}
            </button>

            {schoolStates[school] && (
              <>
                {/* Autofill Controls */}
                <div className=" p-2 shadow-sm">
                  <div className="flex flex-wrap items-center justify-end gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Break Time:</label>
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
                        Lesson Hours:
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
                {/* Table */}
                <table
                  className="w-full border-collapse border text-xs text-var[(--body-text-color)]"
                  style={{
                    fontFamily:
                      '"Noto Sans JP", "Hiragino Kaku Gothic Pro", "Meiryo", sans-serif',
                  }}
                >
                  <thead>
                    <tr className="bg-[var(--signin-input-bg-color)]">
                      <th
                        colSpan={10}
                        className="border px-1 py-1 text-center text-sm font-normal"
                      >
                        Schedule Table (出勤簿)
                      </th>
                    </tr>
                    <tr className="">
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">Date</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/date-icon.svg"
                            alt="date Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">Day</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/day-icon.svg"
                            alt="Day Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">Start Time</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/starting-time-icon.svg"
                            alt="Starting Time Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">End Time</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/finishing-time-icon.svg"
                            alt="Finishing Time Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell w-auto sm:w-auto">
                        <span className="hidden sm:inline">Overtime</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/overtime-icon.svg"
                            alt="Overtime Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">Break Time</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/break-time-icon.svg"
                            alt="Breaktime Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">Working Hours</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/working-hours-icon.svg"
                            alt="Working Hours Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">Lesson Hours</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/lesson-hours-icon.svg"
                            alt="Lesson Hours Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal w-auto sm:w-auto">
                        <span className="hidden sm:inline">
                          Non-Lesson Hours
                        </span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/non-lesson-hours-icon.svg"
                            alt="Non Lesson Hours Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell w-auto sm:w-auto">
                        <span className="hidden sm:inline">Approval</span>
                        <div className="sm:hidden flex items-center justify-center h-5 w-5 relative mx-auto">
                          <Image
                            src="/approved-icon.svg"
                            alt="Approved Icon"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </th>
                    </tr>
                    <tr className="bg-gray-50 sm:table-row hidden">
                      <th className="border px-0.5 py-0.5 font-normal">日付</th>
                      <th className="border px-0.5 py-0.5 font-normal">曜日</th>
                      <th className="border px-0.5 py-0.5 font-normal">
                        出社時間
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal">
                        退社時間
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal hidden sm:table-cell">
                        残業時間
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal">
                        休憩時間
                      </th>
                      <th className="border px-0.5 py-0.5 font-normal">
                        労働時間
                      </th>
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
                        <td className="border px-0.5 py-0.5">
                          <span className="hidden sm:inline">{row.Day}</span>
                          <span className="sm:hidden">{row.Day.charAt(0)}</span>
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
                            className="w-full h-full text-center text-sm bg-transparent border-none outline-none"
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
                            className="w-full h-full text-center text-sm bg-transparent border-none outline-none"
                          />
                        </td>
                        <td className="border px-0.5 py-0.5 hidden sm:table-cell">
                          {row.Overtime}
                        </td>
                        <td className="border px-0.5 py-0.5 w-[42px] text-sm">
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
                            className="w-full h-full text-center text-sm bg-transparent border-none outline-none"
                          />
                        </td>
                        <td className="border px-0.5 py-0.5 w-[42px] text-sm">
                          {calculateTotalWorkingHours(
                            row.StartTime,
                            row.EndTime,
                            row.BreakTime,
                          )}
                        </td>
                        <td className="border px-0.5 py-0.5 w-[42px] text-sm">
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
                            className="w-full h-full text-center text-sm bg-transparent border-none outline-none"
                          />
                        </td>
                        <td className="border text-center text-sm w-[42px]">
                          <span className="w-full text-sm">
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
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-4">
          Please select a schedule to view its details.
        </p>
      )}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleGeneratePDF}
          className="px-6 py-3 bg-green-600 text-white text-sm font-medium hover:bg-green-700 shadow-lg rounded-full"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default withDashboardLayout(Edit);
