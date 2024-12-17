import { useMemo, useState, useEffect } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import RenderTable from "@/components/RenderTable/RenderTable";
import ScheduleOverview from "@/components/ScheduleOverview/ScheduleOverview";
import AutoFillControls from "@/components/AutoFillControls/AutoFillControls";
import { ScheduleData } from "@/interfaces/schedulesInterface";
import { TeachersShift, FilteredSchedule } from "@/interfaces/teachersShift";
import { generateFullMonthData } from "@/utils/generateFullMonthData";
import { autofillBreakTime, autofillLessonHours } from "@/utils/tableUtils";
import { calculateWorkingHours } from "@/utils/generateFullMonthData";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { finalizeTableForExport } from "@/utils/finalizeTableForExportPDF";

function Edit() {
  const { user } = useAuthContext();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [lessonHours, setLessonHours] = useState<string>("0");
  const [breakTimeDefault, setBreakTimeDefault] = useState<string>("1.0");
  const [tableDataM, setTableDataM] = useState<ScheduleData[]>([]);
  const [tableDataT, setTableDataT] = useState<ScheduleData[]>([]);

  const { data: filteredSchedules = [], isLoading } = useQuery<
    FilteredSchedule[]
  >({
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
      if (!response.ok) throw new Error("Failed to fetch filtered schedules");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  // Get the selected schedule's data
  const firebaseData = useMemo<TeachersShift[]>(() => {
    const schedule = filteredSchedules.find(
      (schedule) => schedule.id === selectedSchedule,
    );
    return schedule?.schedules || []; // Adjusted to fetch `schedules` field
  }, [selectedSchedule, filteredSchedules]);

  const teacherName = useMemo(() => {
    const schedule = filteredSchedules.find(
      (schedule) => schedule.id === selectedSchedule,
    );
    return schedule?.teacherName || "N/A";
  }, [selectedSchedule, filteredSchedules]);

  const selectedScheduleData = useMemo(() => {
    return (
      filteredSchedules.find((schedule) => schedule.id === selectedSchedule) ||
      null
    );
  }, [selectedSchedule, filteredSchedules]);

  const year = selectedScheduleData?.year || new Date().getFullYear();
  const month = selectedScheduleData?.month || new Date().getMonth() + 1;

  // Memoized filtering of school data
  const schoolMData = useMemo(
    () => firebaseData.filter((entry) => entry.School === "M"),
    [firebaseData],
  );
  const schoolTData = useMemo(
    () => firebaseData.filter((entry) => entry.School === "T"),
    [firebaseData],
  );

  const fullMonthDataM = useMemo(
    () => generateFullMonthData(schoolMData, year, month),
    [schoolMData, year, month],
  );
  const fullMonthDataT = useMemo(
    () => generateFullMonthData(schoolTData, year, month),
    [schoolTData, year, month],
  );

  // Update tableDataM and tableDataT when fullMonthDataM and fullMonthDataT change
  useEffect(() => {
    setTableDataM(fullMonthDataM);
  }, [fullMonthDataM]);

  useEffect(() => {
    setTableDataT(fullMonthDataT);
  }, [fullMonthDataT]);

  // Function to generate columns with editable LessonHours
  const getColumns = (
    setTableData: React.Dispatch<React.SetStateAction<ScheduleData[]>>,
  ): ColumnDef<ScheduleData, string | number>[] => [
    {
      accessorKey: "Date",
      header: "日付",
      cell: (info) => info.getValue(), // Date is string
    },
    {
      accessorKey: "Day",
      header: "曜日",
      cell: (info) => info.getValue(), // Day is string
    },
    {
      accessorKey: "StartTime",
      header: "出社時間",
      cell: ({ getValue, row }) => {
        const value = getValue(); // StartTime is string
        const rowIndex = row.index;
        return (
          <input
            type="text"
            placeholder="--:--"
            value={value || ""}
            onChange={(e) => {
              const newStartTime = e.target.value;
              setTableData((prevData) => {
                const newData = [...prevData];
                const row = { ...newData[rowIndex] };
                row.StartTime = newStartTime;

                // Recalculate WorkingHours and NonLessonHours
                if (row.EndTime) {
                  const workingHours = calculateWorkingHours(
                    newStartTime,
                    row.EndTime,
                  );
                  row.WorkingHours =
                    workingHours > 0 ? workingHours.toFixed(2) : "";
                  const lessonHours = parseFloat(row.LessonHours || "0");
                  row.NonLessonHours =
                    workingHours > 0
                      ? (workingHours - lessonHours).toFixed(2)
                      : "";
                }

                newData[rowIndex] = row;
                return newData;
              });
            }}
            className="text-center w-[50px] text-[10px] leading-none"
          />
        );
      },
    },
    {
      accessorKey: "EndTime",
      header: "退社時間",
      cell: ({ getValue, row }) => {
        const value = getValue(); // EndTime is string
        const rowIndex = row.index;
        return (
          <input
            type="text"
            placeholder="--:--"
            value={value || ""}
            onChange={(e) => {
              const newEndTime = e.target.value;
              setTableData((prevData) => {
                const newData = [...prevData];
                const row = { ...newData[rowIndex] };
                row.EndTime = newEndTime;

                // Recalculate WorkingHours and NonLessonHours
                if (row.StartTime) {
                  const workingHours = calculateWorkingHours(
                    row.StartTime,
                    newEndTime,
                  );
                  row.WorkingHours =
                    workingHours > 0 ? workingHours.toFixed(2) : "";
                  const lessonHours = parseFloat(row.LessonHours || "0");
                  row.NonLessonHours =
                    workingHours > 0
                      ? (workingHours - lessonHours).toFixed(2)
                      : "";
                }

                newData[rowIndex] = row;
                return newData;
              });
            }}
            className="text-center w-[50px] text-[10px] leading-none"
          />
        );
      },
    },
    {
      accessorKey: "Overtime",
      header: "通常残業時間",
      cell: (info) => info.getValue(), // Overtime is string
    },
    {
      accessorKey: "BreakTime",
      header: "休憩時間",
      cell: ({ getValue, row }) => {
        const value = getValue(); // BreakTime is string
        const rowIndex = row.index;
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => {
              const inputValue = e.target.value;
              setTableData((prevData) => {
                const newData = [...prevData];
                const row = { ...newData[rowIndex] };
                row.BreakTime = inputValue;
                newData[rowIndex] = row;
                return newData;
              });
            }}
            onBlur={() => {
              setTableData((prevData) => {
                const newData = [...prevData];
                const row = { ...newData[rowIndex] };
                const breakTimeNumber = parseFloat(row.BreakTime || "0");
                row.BreakTime = !isNaN(breakTimeNumber)
                  ? breakTimeNumber.toFixed(1)
                  : "";
                newData[rowIndex] = row;
                return newData;
              });
            }}
            className="text-center w-[50px] text-[10px] leading-none"
          />
        );
      },
    },
    {
      accessorKey: "WorkingHours",
      header: "労働時間",
      cell: (info) => (
        <span className="text-[10px] leading-none">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "LessonHours",
      header: "レッスン時間",
      cell: ({ getValue, row }) => {
        const value = getValue(); // LessonHours is number
        const rowIndex = row.index;
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => {
              const inputValue = e.target.value;
              setTableData((prevData) => {
                const newData = [...prevData];
                const row = { ...newData[rowIndex] };
                row.LessonHours = inputValue;

                // Recalculate NonLessonHours
                const lessonHoursNumber = parseFloat(inputValue || "0");
                const workingHours = parseFloat(row.WorkingHours || "0");
                row.NonLessonHours =
                  workingHours > 0
                    ? (workingHours - lessonHoursNumber).toFixed(2)
                    : "";

                newData[rowIndex] = row;
                return newData;
              });
            }}
            className="text-center w-[50px] text-[10px] leading-none"
          />
        );
      },
    },
    {
      accessorKey: "NonLessonHours",
      header: "レッスン外",
      cell: (info) => (
        <span className="text-[10px] leading-none">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "Approval",
      header: "承認",
      cell: (info) => info.getValue(), // Approval is string
    },
  ];

  const columnsM = useMemo(() => getColumns(setTableDataM), [setTableDataM]);
  const columnsT = useMemo(() => getColumns(setTableDataT), [setTableDataT]);

  // Create React Tables
  const tableM = useReactTable({
    data: tableDataM,
    columns: columnsM,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableT = useReactTable({
    data: tableDataT,
    columns: columnsT,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle Auto-Fill Teaching Hours
  const handleAutoFill = () => {
    setTableDataM((prevData) => autofillLessonHours(prevData, lessonHours));
    setTableDataT((prevData) => autofillLessonHours(prevData, lessonHours));
  };

  // Handle Auto-Fill Break Time
  const handleAutoFillBreakTime = () => {
    setTableDataM((prevData) => autofillBreakTime(prevData, breakTimeDefault));
    setTableDataT((prevData) => autofillBreakTime(prevData, breakTimeDefault));
  };

  // Export to PDF function
  const exportToPDF = async (): Promise<void> => {
    const a4Elements = document.querySelectorAll(".a4-page");

    if (!a4Elements.length) {
      console.warn("No elements found with the class .a4-page");
      return;
    }

    // Add the .a4-export class to each .a4-page element
    a4Elements.forEach((el) => el.classList.add("a4-export"));

    // Finalize inputs for all .a4-page elements
    a4Elements.forEach((page) => {
      if (page instanceof HTMLElement) {
        finalizeTableForExport(page);
      }
    });

    // Small delay to allow styles to apply
    await new Promise<void>((resolve) => setTimeout(resolve, 100));

    const pdf = new jsPDF("p", "mm", "a4");

    for (const page of a4Elements) {
      if (page instanceof HTMLElement) {
        try {
          // Render the page as a canvas at a high scale
          const canvas = await html2canvas(page, { scale: 2.5 });

          // Convert the canvas directly to JPEG for jsPDF
          const jpegData = canvas.toDataURL("image/jpeg", 0.9); // JPEG quality

          if (a4Elements[0] !== page) pdf.addPage();
          pdf.addImage(jpegData, "JPEG", 0, 0, 210, 297); // Add to PDF
        } catch (error) {
          console.error("Error generating canvas for page:", page, error);
        }
      }
    }

    // Build the dynamic file name
    const formattedMonth = month < 10 ? `0${month}` : month; // Ensure two-digit month
    const teacherOrScheduleName = teacherName || "Schedule"; // Fallback to 'Schedule' if teacherName is unavailable
    const fileName = `${year}-${formattedMonth}_${teacherOrScheduleName}_出勤簿_Attendance_Record.pdf`;

    // Save the PDF with the new file name
    pdf.save(fileName);

    // Remove the .a4-export class after export
    a4Elements.forEach((el) => el.classList.remove("a4-export"));
  };

  return (
    <div className="relative flex xl:flex-row flex-col xl:flex-1 min-w-0">
      {/* Left Section */}
      <div className="xl:w-[20%] w-full bg-white border-gray-300">
        {isLoading ? (
          <Spinner />
        ) : (
          <ScheduleOverview
            availableSchedules={filteredSchedules}
            selectedScheduleId={selectedSchedule}
            onSelectSchedule={(scheduleId) => setSelectedSchedule(scheduleId)}
          />
        )}
      </div>
      {/* Export Button */}
      <button
        onClick={exportToPDF}
        className="fixed bottom-5 right-5 bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 shadow-lg text-sm md:text-base xl:text-lg"
      >
        Export to PDF
      </button>

      {/* Right Section */}
      <div className="xl:w-[80%] w-full">
        {selectedSchedule ? (
          <>
            <div className="p-0">
              <AutoFillControls
                lessonHours={lessonHours}
                breakTimeDefault={breakTimeDefault}
                onLessonHoursChange={setLessonHours}
                onBreakTimeDefaultChange={setBreakTimeDefault}
                handleAutoFillLessonHours={handleAutoFill}
                handleAutoFillBreakTime={handleAutoFillBreakTime}
              />
            </div>

            {/* School M table */}
            <div className="a4-page">
              <RenderTable
                table={tableM}
                schoolName="南草津校"
                teacherName={teacherName}
                year={year}
                month={typeof month === "string" ? parseInt(month, 10) : month}
              />
            </div>
            {/* School T table */}
            <div className="a4-page">
              <RenderTable
                table={tableT}
                schoolName="高槻校"
                teacherName={teacherName}
                year={year}
                month={typeof month === "string" ? parseInt(month, 10) : month}
              />
            </div>
          </>
        ) : (
          <p className="text-center mt-10">Select a schedule to display.</p>
        )}
      </div>
    </div>
  );
}

export default withDashboardLayout(Edit);
