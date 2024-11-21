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
  Date: string;
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

// Mock data from Firebase
const firebaseData = [
  {
    Employee: "Ari(F)",
    Date: "2024/11/11",
    Day: "Monday",
    School: "M",
    Shift: "12:00-21:00",
  },
  {
    Employee: "Ari(F)",
    Date: "2024/11/12",
    Day: "Tuesday",
    School: "T",
    Shift: "12:00-21:00",
  },
  {
    Employee: "Ari(F)",
    Date: "2024/11/13",
    Day: "Wednesday",
    School: "M",
    Shift: "12:00-21:00",
  },
  {
    Employee: "Ari(F)",
    Date: "2024/11/14",
    Day: "Thursday",
    School: "M",
    Shift: "12:00-21:00",
  },
];

function Edit() {
  // Generate full list of dates for November
  const fullMonthData = useMemo<ScheduleData[]>(() => {
    const fullData: ScheduleData[] = [];
    const daysOfWeek = [
      "日曜日",
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
    ];

    // Helper function to calculate hours and return string format
    const calculateHours = (start: string, end: string): string => {
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      const hours = endH + endM / 60 - (startH + startM / 60);
      return hours.toFixed(1); // Convert back to string
    };

    // Fill in data for all days in November
    for (let i = 1; i <= 30; i++) {
      const date = new Date(2024, 10, i); // 10 = November, months are 0-indexed
      const dayIndex = date.getDay();

      // Find matching Firebase data for the current date
      const firebaseEntry = firebaseData.find(
        (entry) => parseInt(entry.Date.split("/")[2]) === i,
      );

      if (firebaseEntry) {
        // Extract shift details
        const [startTime, endTime] = firebaseEntry.Shift.split("-");
        const calculatedWorkingHours = calculateHours(startTime, endTime);

        // Determine if break time should be applied (only if working hours > 5)
        const breakTime =
          parseFloat(calculatedWorkingHours) > 5 ? "1.0" : "0.0";
        const workingHours = (
          parseFloat(calculatedWorkingHours) - parseFloat(breakTime)
        ).toFixed(1);

        // Set lesson hours and non-lesson hours
        const lessonHours = "6.5"; // Default lesson hours
        const nonLessonHours = Math.max(
          parseFloat(workingHours) - parseFloat(lessonHours),
          0,
        ).toFixed(1);

        // Populate data for matching Firebase entries
        fullData.push({
          Date: i.toString(),
          Day: daysOfWeek[dayIndex],
          Employee: firebaseEntry.Employee,
          StartTime: startTime,
          EndTime: endTime,
          Overtime: "", // Overtime should be empty by default
          BreakTime: breakTime,
          WorkingHours: workingHours,
          LessonHours: lessonHours,
          NonLessonHours: nonLessonHours,
          Approval: "",
        });
      } else {
        // Populate empty data for dates without Firebase entries
        fullData.push({
          Date: i.toString(),
          Day: daysOfWeek[dayIndex],
          Employee: "",
          StartTime: "",
          EndTime: "",
          Overtime: "",
          BreakTime: "",
          WorkingHours: "",
          LessonHours: "",
          NonLessonHours: "",
          Approval: "",
        });
      }
    }

    return fullData;
  }, []);

  // Define columns with string types
  const columns = useMemo<ColumnDef<ScheduleData, string>[]>(() => {
    const columnHelper = createColumnHelper<ScheduleData>();

    return [
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
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("WorkingHours", {
        header: "労働時間",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("LessonHours", {
        header: "レッスン時間",
        cell: (info) => info.getValue(),
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
  }, []);

  // Create table instance
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
            <th className="border border-black px-2 py-1 font-normal">
              Starting Time
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Finishing Time
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Overtime
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Break Time
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Working Hours
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Lesson Hours
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Non Lesson Hours
            </th>
            <th className="border border-black px-2 py-1 font-normal">
              Approval
            </th>
          </tr>
          {/* Japanese Headers Row */}
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className="border border-black px-2 py-1 font-normal"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
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
