import { useMemo, useState, useEffect } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import {
  useReactTable,
  createColumnHelper,
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

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const columnHelper = createColumnHelper<ScheduleData>();

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

  const firebaseData = useMemo<TeachersShift[]>(() => {
    const schedule = filteredSchedules.find(
      (schedule) => schedule.id === selectedSchedule,
    );
    return schedule?.schedules || [];
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

  useEffect(() => {
    setTableDataM(fullMonthDataM);
  }, [fullMonthDataM]);

  useEffect(() => {
    setTableDataT(fullMonthDataT);
  }, [fullMonthDataT]);

  const getColumns = (
    setTableData: React.Dispatch<React.SetStateAction<ScheduleData[]>>,
  ): ColumnDef<ScheduleData, any>[] => [
    columnHelper.accessor("Date", {
      header: "日付",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("Day", {
      header: "曜日",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("StartTime", {
      header: "出社時間",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("EndTime", {
      header: "退社時間",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("Overtime", {
      header: "通常残業時間",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("BreakTime", {
      header: "休憩時間",
      cell: (info) => {
        const value = info.getValue();
        const rowIndex = info.row.index;
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
                const breakTimeNumber = parseFloat(row.BreakTime);
                if (!isNaN(breakTimeNumber)) {
                  row.BreakTime = breakTimeNumber.toFixed(1);
                } else {
                  row.BreakTime = "";
                }
                newData[rowIndex] = row;
                return newData;
              });
            }}
            className="text-center w-[50px] text-[7px] leading-none"
          />
        );
      },
    }),
    columnHelper.accessor("WorkingHours", {
      header: "労働時間",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("LessonHours", {
      header: "レッスン時間",
      cell: (info) => {
        const value = info.getValue();
        const rowIndex = info.row.index;
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
                newData[rowIndex] = row;
                return newData;
              });
            }}
            onBlur={() => {
              setTableData((prevData) => {
                const newData = [...prevData];
                const row = { ...newData[rowIndex] };
                const lessonHoursNumber = parseFloat(row.LessonHours);
                if (!isNaN(lessonHoursNumber)) {
                  row.LessonHours = lessonHoursNumber.toFixed(2);
                  const workingHours = parseFloat(row.WorkingHours) || 0;
                  row.NonLessonHours = (
                    workingHours - lessonHoursNumber
                  ).toFixed(2);
                } else {
                  row.LessonHours = "";
                  row.NonLessonHours = "";
                }
                newData[rowIndex] = row;
                return newData;
              });
            }}
            className="text-center w-[50px] text-[7px] leading-none"
          />
        );
      },
    }),
    columnHelper.accessor("NonLessonHours", {
      header: "レッスン外",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("Approval", {
      header: "承認",
      cell: (info) => info.getValue(),
    }),
  ];

  const columnsM = useMemo(() => getColumns(setTableDataM), [setTableDataM]);
  const columnsT = useMemo(() => getColumns(setTableDataT), [setTableDataT]);

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

  const handleAutoFill = () => {
    setTableDataM((prevData) => autofillLessonHours(prevData, lessonHours));
    setTableDataT((prevData) => autofillLessonHours(prevData, lessonHours));
  };

  const handleAutoFillBreakTime = () => {
    setTableDataM((prevData) => autofillBreakTime(prevData, breakTimeDefault));
    setTableDataT((prevData) => autofillBreakTime(prevData, breakTimeDefault));
  };

  const finalizeTableForExport = () => {
    const inputs =
      document.querySelectorAll<HTMLInputElement>(".a4-page input");
    inputs.forEach((input) => {
      const span = document.createElement("span");
      span.textContent = input.value || "";
      span.style.display = "inline-block";
      span.style.width = input.offsetWidth + "px";
      span.style.height = input.offsetHeight + "px";
      span.style.textAlign = getComputedStyle(input).textAlign;
      span.style.fontSize = getComputedStyle(input).fontSize;
      input.parentNode?.replaceChild(span, input);
    });
  };

  const exportToPDF = async () => {
    const a4Element = document.querySelector(".a4-page") as HTMLElement | null;

    if (!a4Element) {
      console.error("A4 element not found!");
      return;
    }

    try {
      a4Element.classList.add("a4-export");
      finalizeTableForExport();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(a4Element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save("schedule.pdf");
    } finally {
      a4Element.classList.remove("a4-export");
    }
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
      <button onClick={exportToPDF}>Export to PDF</button>

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
