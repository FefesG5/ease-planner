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
    staleTime: 10 * 60 * 1000,
  });

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

    for (let i = 1; i <= 30; i++) {
      const date = new Date(2024, 10, i); // 10 = November, months are 0-indexed
      const dayIndex = date.getDay();

      // Find matching Firebase data for the current date
      const firebaseEntry = schoolData.find(
        (entry) => parseInt(entry.Date.split("/")[2]) === i,
      );

      if (firebaseEntry) {
        const [startTime, endTime] = firebaseEntry.Shift.split("-");

        fullData.push({
          Employee: firebaseEntry.Employee,
          Date: i.toString(),
          Day: daysOfWeek[dayIndex],
          School: firebaseEntry.School,
          StartTime: startTime,
          EndTime: endTime,
          Overtime: "",
          BreakTime: "",
          WorkingHours: "",
          LessonHours: "",
          NonLessonHours: "",
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

  const fullMonthDataM = generateFullMonthData(schoolMData);
  const fullMonthDataT = generateFullMonthData(schoolTData);

  const columnHelper = createColumnHelper<ScheduleData>();
  const columns: ColumnDef<ScheduleData, string>[] = [
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

  const tableM = useReactTable<ScheduleData>({
    data: fullMonthDataM,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableT = useReactTable<ScheduleData>({
    data: fullMonthDataT,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative flex xl:flex-row flex-col xl:flex-1 min-w-0">
      {/* Left Section - Available Schedules */}
      <div className="xl:w-[20%] w-full bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)]">
        {isLoading ? (
          <Spinner />
        ) : (
          <ScheduleOverview availableSchedules={filteredSchedules} />
        )}
      </div>

      {/* Right Section - A4 Page*/}
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
