import { useMemo, useState } from "react";
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
import { generateFullMonthData } from "@/utils/generateFullMonthData";

// Move columnHelper outside the component
const columnHelper = createColumnHelper<ScheduleData>();

// Define interfaces
interface FirebaseDataEntry {
  Employee: string;
  Date: string;
  Day: string;
  School: string;
  Shift: string;
}

interface FilteredSchedule {
  id: string;
  month: string;
  year: number;
  generatedAt: string;
  teacherName: string;
  data: FirebaseDataEntry[];
}

function Edit() {
  const { user } = useAuthContext();
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  // Fetch filtered schedules using React Query
  const {
    data: filteredSchedules = [],
    isLoading,
    isError,
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

      if (!response.ok) throw new Error("Failed to fetch filtered schedules");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  // Get the selected schedule's data
  const firebaseData = useMemo<FirebaseDataEntry[]>(() => {
    const schedule = filteredSchedules.find(
      (schedule) => schedule.id === selectedSchedule,
    );
    return schedule?.data || [];
  }, [selectedSchedule, filteredSchedules]);

  const teacherName = useMemo(() => {
    const schedule = filteredSchedules.find(
      (schedule) => schedule.id === selectedSchedule,
    );
    return schedule?.teacherName || "N/A";
  }, [selectedSchedule, filteredSchedules]);

  // Memoized filtering of school data
  const schoolMData = useMemo(
    () => firebaseData.filter((entry) => entry.School === "M"),
    [firebaseData],
  );
  const schoolTData = useMemo(
    () => firebaseData.filter((entry) => entry.School === "T"),
    [firebaseData],
  );

  // Memoized processed data for tables
  const fullMonthDataM = useMemo(
    () => generateFullMonthData(schoolMData, 2024, 11), // Adjust year and month as needed
    [schoolMData],
  );
  const fullMonthDataT = useMemo(
    () => generateFullMonthData(schoolTData, 2024, 11), // Adjust year and month as needed
    [schoolTData],
  );

  // Memoized column definitions
  const columns = useMemo<ColumnDef<ScheduleData, string>[]>(
    () => [
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
    ],
    [],
  );

  // Create React Tables
  const tableM = useReactTable({
    data: fullMonthDataM,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableT = useReactTable({
    data: fullMonthDataT,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative flex xl:flex-row flex-col xl:flex-1 min-w-0">
      {/* Left Section */}
      <div className="xl:w-[20%] w-full bg-white border-gray-300">
        {isLoading ? (
          <Spinner />
        ) : (
          <ScheduleOverview
            availableSchedules={filteredSchedules} // Available schedules from API
            selectedScheduleId={selectedSchedule} // Pass the selected schedule ID
            onSelectSchedule={(scheduleId) => setSelectedSchedule(scheduleId)} // Update state on selection
          />
        )}
      </div>

      {/* Right Section */}
      <div className="xl:w-[80%] w-full">
        {selectedSchedule ? (
          <>
            <div className="a4-page">
              <RenderTable
                table={tableM}
                schoolName="南草津校"
                teacherName={
                  filteredSchedules.find(
                    (schedule) => schedule.id === selectedSchedule,
                  )?.teacherName || ""
                }
                year={2024} // Replace with dynamic year if needed
                month={11} // Replace with dynamic month if needed
              />
            </div>
            <div className="a4-page">
              <RenderTable
                table={tableT}
                schoolName="高槻校"
                teacherName={
                  filteredSchedules.find(
                    (schedule) => schedule.id === selectedSchedule,
                  )?.teacherName || ""
                }
                year={2024} // Replace with dynamic year if needed
                month={11} // Replace with dynamic month if needed
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
