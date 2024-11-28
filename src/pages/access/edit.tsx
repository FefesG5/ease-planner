import withDashboardLayout from "@/hoc/withDashboardLayout";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  ColumnDef,
  CellContext,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import RenderTable from "@/components/RenderTable/RenderTable";
import ScheduleOverview from "@/components/ScheduleOverview/ScheduleOverview";
import { ScheduleData } from "@/interfaces/schedulesInterface";

// Mock data from Firebase
const firebaseData = [
  {
    Employee: "Ari(F)",
    Date: "2024/11/06",
    Day: "Wednesday",
    School: "M",
    Shift: "12:00-21:00",
  },
  {
    Employee: "Ari(F)",
    Date: "2024/11/07",
    Day: "Thursday",
    School: "M",
    Shift: "12:00-21:00",
  },
  {
    Employee: "Ari(F)",
    Date: "2024/11/08",
    Day: "Friday",
    School: "T",
    Shift: "12:00-21:00",
  },
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
];

function Edit() {
  const { user } = useAuthContext();

  // React Query to fetch filtered schedules
  const {
    data: filteredSchedules = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["filteredSchedules"], // Query key
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();
      const userId = user.uid;

      // Corrected fetch call with the proper API route
      const response = await fetch(
        `/api/schedules/getFilteredSchedulesByUser?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch filtered schedules");
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Cache the data for 10 minutes
  });

  // Log the fetched schedules to the console for debugging
  if (!isLoading && !isError) {
    console.log("Fetched Filtered Schedules:", filteredSchedules);
  }

  if (isError) {
    console.error("Error fetching filtered schedules:", error);
  }

  // Split the data by school
  const schoolMData = firebaseData.filter((entry) => entry.School === "M");
  const schoolTData = firebaseData.filter((entry) => entry.School === "T");

  // Helper function to generate the full month data for a given school
  const generateFullMonthData = (
    schoolData: typeof firebaseData,
  ): ScheduleData[] => {
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
      const firebaseEntry = schoolData.find(
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
          Employee: firebaseEntry.Employee,
          Date: i.toString(),
          Day: daysOfWeek[dayIndex],
          School: firebaseEntry.School,
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
          Employee: "",
          Date: i.toString(),
          Day: daysOfWeek[dayIndex],
          School: "",
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
  };

  const [fullMonthDataM, setFullMonthDataM] = useState<ScheduleData[]>(
    generateFullMonthData(schoolMData),
  );
  const [fullMonthDataT, setFullMonthDataT] = useState<ScheduleData[]>(
    generateFullMonthData(schoolTData),
  );

  // EditableCell component
  const EditableCell = ({
    cellProps,
    updateData,
  }: {
    cellProps: CellContext<ScheduleData, string>;
    updateData: React.Dispatch<React.SetStateAction<ScheduleData[]>>;
  }) => {
    const [value, setValue] = useState(cellProps.getValue() || "");

    const rowIndex = cellProps.row.index;
    const columnId = cellProps.column.id;

    const onBlur = () => {
      // Update the state in the parent component only when the value has changed
      updateData((old) =>
        old.map((row, index) =>
          index === rowIndex ? { ...row, [columnId]: value } : row,
        ),
      );
    };

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        className="w-full h-full text-xs bg-transparent border-none p-0 m-0 text-center focus:outline-none"
        style={{ lineHeight: "1.2" }}
      />
    );
  };

  // Define columns with editable cells for specified columns
  const columnHelper = createColumnHelper<ScheduleData>();
  const createColumns = (
    updateData: React.Dispatch<React.SetStateAction<ScheduleData[]>>,
  ): ColumnDef<ScheduleData, string>[] => [
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
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("EndTime", {
      header: "退社時間",
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("Overtime", {
      header: "通常残業時間",
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("BreakTime", {
      header: "休憩時間",
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("WorkingHours", {
      header: "労働時間",
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("LessonHours", {
      header: "レッスン時間",
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("NonLessonHours", {
      header: "レッスン外",
      cell: (info) => <EditableCell cellProps={info} updateData={updateData} />,
    }),
    columnHelper.accessor("Approval", {
      header: "承認",
      cell: (info) => info.getValue(),
    }),
  ];

  // Create table instances for both schools with proper typing
  const columnsM = createColumns(setFullMonthDataM);
  const columnsT = createColumns(setFullMonthDataT);

  const tableM = useReactTable<ScheduleData>({
    data: fullMonthDataM,
    columns: columnsM,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableT = useReactTable<ScheduleData>({
    data: fullMonthDataT,
    columns: columnsT,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative flex xl:flex-row flex-col xl:flex-1 min-w-0">
      {/* Left Section - Available Schedules */}
      <div className="xl:w-[20%] w-full bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)]">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ScheduleOverview availableSchedules={filteredSchedules} />
        )}
      </div>

      {/* Right Section - A4 Editable Tables */}
      <div className="xl:w-[80%] w-full">
        {/* First table */}
        <div className="a4-page">
          <RenderTable
            table={tableM}
            schoolName="南草津校"
            teacherName="Ari(F)"
          />
        </div>
        {/* Second table */}
        <div className="a4-page">
          <RenderTable
            table={tableT}
            schoolName="高槻校"
            teacherName="Ari(F)"
          />
        </div>
      </div>
    </div>
  );
}

export default withDashboardLayout(Edit);
