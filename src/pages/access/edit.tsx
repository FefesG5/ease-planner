import withDashboardLayout from "@/hoc/withDashboardLayout";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";

// Define the data type
type ScheduleData = {
  Employee: string;
  Date: number; // Date as a simple day number
  Day: string;
  StartTime: string;
  EndTime: string;
  Overtime: string;
  BreakTime: string;
  WorkingHours: string;
  LessonHours: string;
  NonLessonHours: string;
  Approval: string;
};

function Edit() {
  // Hardcoded Data
  const hardcodedData: ScheduleData[] = [
    { Date: 6, Day: "水曜日", Employee: "Ari(F)", StartTime: "12:00", EndTime: "21:00", Overtime: "1.0", BreakTime: "1.5", WorkingHours: "8.0", LessonHours: "6.5", NonLessonHours: "1.5", Approval: "" },
    { Date: 7, Day: "木曜日", Employee: "Ari(F)", StartTime: "12:00", EndTime: "21:00", Overtime: "1.0", BreakTime: "1.5", WorkingHours: "8.0", LessonHours: "6.5", NonLessonHours: "1.5", Approval: "" },
    { Date: 8, Day: "金曜日", Employee: "Ari(F)", StartTime: "12:00", EndTime: "21:00", Overtime: "1.0", BreakTime: "1.5", WorkingHours: "8.0", LessonHours: "6.5", NonLessonHours: "1.5", Approval: "" },
    // Other hardcoded entries here...
  ];

  // Generate full list of dates for November
  const fullMonthData = useMemo<ScheduleData[]>(() => {
    const fullData: ScheduleData[] = [];
    const daysOfWeek = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

    for (let i = 1; i <= 30; i++) {
      const date = new Date(2024, 10, i); // 10 = November, months are 0-indexed
      const dayIndex = date.getDay();

      fullData.push({
        Date: i,
        Day: daysOfWeek[dayIndex],
        Employee: "",
        StartTime: "",
        EndTime: "",
        Overtime: "",
        BreakTime: "",
        WorkingHours: "",
        LessonHours: "",
        NonLessonHours: "",
        Approval: ""
      });
    }

    // Overlay the hardcoded data
    hardcodedData.forEach(hardcoded => {
      const index = fullData.findIndex(entry => entry.Date === hardcoded.Date);
      if (index > -1) {
        fullData[index] = { ...fullData[index], ...hardcoded };
      }
    });

    return fullData;
  }, [hardcodedData]);

  // Define columns
  const columnHelper = createColumnHelper<ScheduleData>();

  const columns = useMemo<ColumnDef<ScheduleData, any>[]>(() => [
    columnHelper.accessor("Date", {
      header: "日付",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("Day", {
      header: "曜日",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("StartTime", {
      header: "出社時間",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("EndTime", {
      header: "退社時間",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("Overtime", {
      header: "通常残業時間",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("BreakTime", {
      header: "休憩時間",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("WorkingHours", {
      header: "労働時間",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("LessonHours", {
      header: "レッスン時間",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("NonLessonHours", {
      header: "レッスン外",
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("Approval", {
      header: "承認",
      cell: info => info.getValue(),
    }),
  ], []);

  const table = useReactTable({
    data: fullMonthData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Review & Edit</h1>
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          {/* English Headers Row */}
          <tr>
            <th className="border border-black px-2 py-1 font-normal">Date</th>
            <th className="border border-black px-2 py-1 font-normal">Day</th>
            <th className="border border-black px-2 py-1 font-normal">Starting Time</th>
            <th className="border border-black px-2 py-1 font-normal">Finishing Time</th>
            <th className="border border-black px-2 py-1 font-normal">Overtime</th>
            <th className="border border-black px-2 py-1 font-normal">Break Time</th>
            <th className="border border-black px-2 py-1 font-normal">Working Hours</th>
            <th className="border border-black px-2 py-1 font-normal">Lesson Hours</th>
            <th className="border border-black px-2 py-1 font-normal">Non Lesson Hours</th>
            <th className="border border-black px-2 py-1 font-normal">Approval</th>
          </tr>
          {/* Japanese Headers Row */}
          <tr>
            {table.getHeaderGroups()[0].headers.map(header => (
              <th key={header.id} className="border border-black px-2 py-1 font-normal">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="border border-black px-2 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withDashboardLayout(Edit);
