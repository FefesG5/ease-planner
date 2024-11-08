import { useState, useEffect } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import Spinner from "@/components/Spinner/Spinner";

// Define the Schedule interface
interface Schedule {
  id: string;
  name: string;
  month: string;
  year: string;
  signedUrl: string;
}

function Schedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [checkedSchedule, setCheckedSchedule] = useState<string | null>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

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

  // Handle loading and error states
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="flex lg:flex-row flex-col lg:flex-1 space-y-2 lg:space-y-0 lg:space-x-6 min-w-0 p-0 lg:p-4">
      {/* Left Section - Filters and File List */}
      <div className="lg:w-1/4 w-full flex flex-col justify-between min-h-[600px] p-2 lg:p-4 text-[color:var(--body-text-color)] lg:flex-shrink-0 bg-[var(--user-section-bg-color)] border border-[var(--sidebar-border-color)] shadow-sm">
        <div className="space-y-4">
          <h1 className="text-xl font-semibold mb-1 text-center lg:text-left">
            Available Schedules
          </h1>
          {/* Filters */}
          <div className="space-y-1">
            <select
              className="form-select w-full p-2 text-sm bg-[var(--signin-input-bg-color)] text-[color:var(--body-text-color)] border-[var(--signin-input-border-color)] cursor-pointer"
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
              className="form-select w-full p-2 text-sm bg-[var(--signin-input-bg-color)] text-[color:var(--body-text-color)] border-[var(--signin-input-border-color)] cursor-pointer"
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
          <ul className="space-y-1 overflow-y-auto lg:max-h-[300px] h-64">
            {filteredSchedules.map((schedule) => (
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
                      {schedule.name}
                    </p>
                    <p className="text-[color:var(--body-text-color)]">
                      {schedule.month} {schedule.year}
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
        </div>

        {/* Generate Button */}
        <button
          className="mt-4 w-full bg-[var(--signin-btn-bg-color)] text-white p-2 text-sm hover:bg-blue-600"
          disabled={!checkedSchedule}
        >
          Generate
        </button>
      </div>

      {/* Right Section (Preview) for Desktop */}
      {selectedSchedule && (
        <div className="flex-grow lg:w-3/4">
          <div className="border lg:p-4 p-2 shadow-md bg-[var(--user-section-bg-color)] border-[var(--sidebar-border-color)] min-h-[600px] overflow-auto">
            <h2 className="text-lg font-semibold mb-3 text-[var(--body-text-color)]">
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
        <div className="lg:hidden fixed inset-0 bg-[var(--user-section-bg-color)] z-50 p-0 overflow-y-auto border-[var(--sidebar-border-color)]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--body-text-color)]">
              Preview: {selectedSchedule.name}
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
              className="w-full h-[70vh] border"
              title={`Preview of ${selectedSchedule.name}`}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default withDashboardLayout(Schedule);
