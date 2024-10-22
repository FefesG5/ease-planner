import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// Define the Schedule interface
interface Schedule {
  id: string;
  name: string;
  month: string;
  year: string;
  signedUrl: string;
}

export default function Schedule() {
  const { user, loading, isAuthorized, signOutUser } = useAuthContext();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [checkedSchedule, setCheckedSchedule] = useState<string | null>(null); // Track the selected file with a checkbox

  // States to store selected filter values for year and month
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("/api/schedules/monthlyWorkingSchedules");
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data: Schedule[] = await response.json();
        setSchedules(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Filter schedules based on selected year and month
  const filteredSchedules = schedules.filter((schedule) => {
    if (filterYear && schedule.year !== filterYear) return false;
    if (filterMonth && schedule.month !== filterMonth) return false;
    return true;
  });

  // Handle selecting a schedule to preview
  const handleScheduleSelect = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  // Handle selecting a schedule via checkbox
  const handleCheckboxChange = (scheduleId: string) => {
    setCheckedSchedule(scheduleId === checkedSchedule ? null : scheduleId); // Allow only one checkbox to be checked
  };

  // Handle loading and authorization states
  if (loading || isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <p className="text-center text-lg">
        You must be logged in to access this page.
      </p>
    );
  }

  if (!isAuthorized) {
    return (
      <p className="text-center text-lg">
        You are not authorized to access this page.
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <DashboardLayout user={user} signOutUser={signOutUser}>
      <div className="lg:flex lg:space-x-8">
        {/* Left Section - Filters and File List */}
        <div className="lg:w-1/3 space-y-6">
          <h1 className="text-3xl font-bold mb-4">
            Available Working Schedules
          </h1>

          {/* Filters */}
          <div className="space-y-2">
            <select
              className="form-select w-full p-2 border rounded-md"
              value={filterYear || ""}
              onChange={(e) => setFilterYear(e.target.value || null)}
            >
              <option value="">Filter by Year</option>
              {Array.from(new Set(schedules.map((s) => s.year))).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className="form-select w-full p-2 border rounded-md"
              value={filterMonth || ""}
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
          <ul className="space-y-4 overflow-y-auto h-[calc(100vh-16rem)] lg:h-auto">
            {filteredSchedules.map((schedule) => (
              <li
                key={schedule.id}
                className="p-4 border rounded-lg shadow-md hover:shadow-lg cursor-pointer flex justify-between items-center"
              >
                <div
                  className="flex items-center space-x-4"
                  onClick={() => handleScheduleSelect(schedule)}
                >
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium text-lg">{schedule.name}</p>
                    <p className="text-sm text-gray-500">
                      {schedule.month} {schedule.year}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedSchedule === schedule.id}
                  onChange={() => handleCheckboxChange(schedule.id)}
                  className="form-checkbox h-5 w-5"
                />
              </li>
            ))}
          </ul>

          {/* Generate Button (Non-functional for now) */}
          <button
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            disabled={!checkedSchedule} // Only enabled if a file is selected
          >
            Generate
          </button>
        </div>

        {/* Right Section (Preview) */}
        {selectedSchedule && (
          <div className="lg:w-2/3">
            <div className="sticky top-0 border rounded-lg p-4 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Preview: {selectedSchedule.name}
              </h2>
              <iframe
                src={selectedSchedule.signedUrl}
                className="w-full h-96 border rounded-lg"
                title={`Preview of ${selectedSchedule.name}`}
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
