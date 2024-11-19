import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import Spinner from "@/components/Spinner/Spinner";
import { useAuthContext } from "@/contexts/AuthContext";
import { teacherNames } from "@/data/teachersName";

// Define the Schedule interface
interface Schedule {
  id: string;
  name: string;
  month: string;
  year: string;
  signedUrl: string;
}

// Define NotificationType to specify success or error
type NotificationType = "success" | "error" | null;

function Schedule() {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [checkedSchedule, setCheckedSchedule] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // States to store selected filter values for year and month
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  const { user } = useAuthContext(); // Get the authenticated user from context

  // Using React Query to fetch schedules
  const {
    data: schedules = [],
    isLoading,
    isError,
    error,
  } = useQuery<Schedule[], Error>({
    queryKey: ["schedules"],
    queryFn: async (): Promise<Schedule[]> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const token = await user.getIdToken();

      const response = await fetch("/api/schedules/monthlyWorkingSchedules", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter schedules based on selected year and month
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesYear = !filterYear || schedule.year === filterYear;
    const matchesMonth = !filterMonth || schedule.month === filterMonth;
    return matchesYear && matchesMonth;
  });

  // Handle selecting a schedule to preview
  const handleScheduleSelect = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsMobilePreviewOpen(true); // Open the mobile modal for preview
  };

  // Handle closing the mobile preview
  const closeMobilePreview = () => {
    setIsMobilePreviewOpen(false);
    setSelectedSchedule(null);
  };

  // Handle selecting a schedule via checkbox
  const handleCheckboxChange = (scheduleId: string) => {
    setCheckedSchedule(scheduleId === checkedSchedule ? null : scheduleId); // Allow only one checkbox to be checked
  };

  // Handle generating the filtered schedule
  const handleGenerateClick = async () => {
    if (!user || !checkedSchedule || !selectedTeacher) {
      setNotification({
        message: "Please select a schedule and a teacher before generating.",
        type: "error",
      });
      return;
    }

    // Get the user's unique ID from the auth context (user object)
    const userId = user.uid;

    if (!userId) {
      setNotification({
        message: "Unable to identify user. Please try again.",
        type: "error",
      });
      return;
    }

    // Extract the year and month from the selected schedule ID (e.g., 'workingSchedule-2024-November-UUID')
    const parts = checkedSchedule.split("-");
    const year = parts[1]; // e.g., '2024'
    const monthString = parts[2]; // e.g., 'November'

    // Convert month name to numeric representation (e.g., 'November' -> '11')
    const month = new Date(Date.parse(`${monthString} 1, 2024`)).getMonth() + 1; // This will give 11 for 'November'
    const formattedMonth = month < 10 ? `0${month}` : `${month}`; // Ensure month is in 'MM' format (e.g., '11')

    // Construct the correct Firestore document ID (e.g., '2024-11')
    const scheduleId = `${year}-${formattedMonth}`;

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/schedules/generateFilteredSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleId, // Use the correct schedule ID (e.g., '2024-11')
          teacherName: selectedTeacher,
          userId, // Pass the user's unique ID directly to the backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate filtered schedule",
        );
      }

      // If the schedule is successfully generated, notify and reset state.
      setNotification({
        message: "Filtered schedule saved successfully.",
        type: "success",
      });

      // Reset selected teacher, checked schedule, and mobile preview (if necessary)
      setSelectedTeacher(null);
      setCheckedSchedule(null);
      setSelectedSchedule(null);
      setIsMobilePreviewOpen(false);
    } catch (error) {
      console.error("Error generating schedule:", error);
      setNotification({
        message: "Error generating schedule. Please try again.",
        type: "error",
      });
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <p className="text-center text-red-500">{error?.message}</p>;
  }

  return (
    <div className="flex xl:flex-row flex-col xl:flex-1 space-y-2 xl:space-y-0 xl:space-x-4 min-w-0 p-0 xl:p-4">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 text-center ${
            notification.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Left Section - Filters and File List */}
      <div className="xl:w-[30%] w-full flex flex-col justify-between min-h-[600px] p-4 xl:p-4 text-[color:var(--body-text-color)] xl:flex-shrink-0 bg-[var(--user-section-bg-color)]">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold mb-1 text-center xl:text-left">
            Available Schedules
          </h1>
          {/* Filters */}
          <div className="space-y-1">
            <select
              className="form-select w-full p-2 text-sm bg-[var(--signin-input-bg-color)] text-[color:var(--body-text-color)] border-[var(--signin-input-border-color)] cursor-pointer"
              value={filterYear || ""}
              onChange={(e) =>
                setFilterYear(e.target.value !== "" ? e.target.value : null)
              }
            >
              <option value="">Filter by Year</option>
              {Array.from(new Set(schedules.map((s) => s.year))).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className="form-select w-full p-2 text-sm bg-[var(--signin-input-bg-color)] text-[color:var(--body-text-color)] border-[var(--signin-input-border-color)] cursor-pointer"
              value={filterMonth ?? ""}
              onChange={(e) => setFilterMonth(e.target.value || null)}
            >
              <option value="">Filter by Month</option>
              {Array.from(new Set(schedules.map((s) => s.month))).map(
                (month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Schedule List */}
          <ul className="space-y-1 overflow-y-auto xl:max-h-[300px] h-64">
            {filteredSchedules.map((schedule: Schedule) => (
              <li
                key={schedule.id}
                className="p-3 border shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center bg-[var(--schedule-list-bg-color)] border-[var(--sidebar-border-color)] hover:bg-[var(--schedule-item-hover-bg-color)] transition-all duration-200 ease-in-out"
              >
                <div
                  className="flex items-center space-x-2"
                  onClick={() => handleScheduleSelect(schedule)}
                >
                  <span className="text-lg text-[color:var(--body-text-color)]">
                    📄
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-[color:var(--body-text-color)]">
                      {schedule.month} {schedule.year}
                    </p>
                    <p className="italic text-[color:var(--body-text-color)]">
                      {schedule.name}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedSchedule === schedule.id}
                  onChange={() => handleCheckboxChange(schedule.id)}
                  className="form-checkbox h-4 w-4 text-blue-500 border-[var(--sidebar-border-color)]"
                />
              </li>
            ))}
          </ul>

          {/* Teacher Selection */}
          <select
            className="form-select w-full p-2 mt-4"
            value={selectedTeacher ?? ""}
            onChange={(e) => setSelectedTeacher(e.target.value || null)}
          >
            <option value="">Select Teacher</option>
            {teacherNames.map((teacherName) => (
              <option key={teacherName} value={teacherName}>
                {teacherName}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <button
          className="mt-4 w-full bg-[var(--signin-btn-bg-color)] text-white p-2 text-sm hover:bg-blue-600"
          disabled={!checkedSchedule || !selectedTeacher}
          onClick={handleGenerateClick}
        >
          Generate
        </button>
      </div>

      {/* Right Section (Preview) for Desktop */}
      {selectedSchedule && (
        <div className="flex-grow xl:w-[70%] hidden xl:block">
          <div className="border xl:p-4 p-2 shadow-md bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)] min-h-[600px] overflow-auto">
            <h2 className="text-lg font-semibold mb-3 text-[color:var(--body-text-color)]">
              Preview: {selectedSchedule.name}
            </h2>
            <iframe
              src={selectedSchedule.signedUrl}
              className="w-full h-[500px] border"
              title={`Preview of ${selectedSchedule.name}`}
            ></iframe>
          </div>
        </div>
      )}

      {/* Mobile Modal Preview */}
      {isMobilePreviewOpen && selectedSchedule && (
        <div className="xl:hidden fixed inset-0 bg-[var(--user-section-bg-color)] z-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--body-text-color)]">
              Preview: {selectedSchedule.month} {selectedSchedule.year}
            </h2>
            <button
              onClick={closeMobilePreview}
              className="text-red-600 font-bold"
            >
              Close
            </button>
          </div>
          <div className="mt-2">
            <iframe
              src={selectedSchedule.signedUrl}
              className="w-full h-[80vh]"
              title={`Preview of ${selectedSchedule.name}`}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default withDashboardLayout(Schedule);
