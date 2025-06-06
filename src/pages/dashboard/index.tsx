import { useState, useRef, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner/Spinner";
import FloatingNotification from "@/components/FloatingNotification/FloatingNotification";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { FilteredSchedule } from "@/interfaces/teachersShift";
import { ThemeContext } from "@/contexts/ThemeContext";
import Image from "next/image";

// Define NotificationType to specify success, error, or info
type NotificationType = "success" | "error" | "info" | null;

function Schedule() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(
    null,
  ); // Track the deleting schedule
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const { theme } = useContext(ThemeContext);
  const iconSrc =
    theme === "dark" ? "/calendar-icon-white.svg" : "/calendar-icon.svg";

  // ✅ Fetch schedules using react-query
  const {
    data: schedules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["filteredSchedules", user?.uid],
    queryFn: async (): Promise<FilteredSchedule[]> => {
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/schedules/getFilteredSchedulesByUser?userId=${user.uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch schedules");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  // ✅ Show Notification Helper Function
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });

    // Clear existing timeout before setting a new one
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }

    // Auto-dismiss the notification after 5 seconds
    notificationTimeout.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // ✅ Delete schedule mutation (integrated with notification)
  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      setDeletingScheduleId(scheduleId);
      const token = await user?.getIdToken();
      const response = await fetch(`/api/schedules/deleteSchedule`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduleId, userId: user?.uid }),
      });
      if (!response.ok) throw new Error("Failed to delete schedule.");
    },
    onSuccess: () => {
      setDeletingScheduleId(null);
      queryClient.invalidateQueries({ queryKey: ["filteredSchedules"] });
      showNotification("Schedule deleted successfully!", "success");
    },
    onError: () => {
      setDeletingScheduleId(null);
      showNotification("Failed to delete schedule.", "error");
    },
  });

  // ✅ Loading and error handling
  if (isLoading) return <Spinner />;
  if (error) {
    showNotification(error.message, "error");
    return <p className="text-red-500">{error.message}</p>;
  }

  return (
    <div className="p-4 bg-[var(--user-section-bg-color)] min-h-screen">
      <h1 className="text-base font-bold text-center mb-1">
        GENERATED SCHEDULES
      </h1>

      {notification && notification.type && (
        <FloatingNotification
          message={notification.message}
          type={notification.type}
        />
      )}

      <ul className="space-y-4">
        {schedules.map((schedule: FilteredSchedule) => (
          <li
            key={schedule.id}
            className="border p-2 flex justify-between items-center shadow bg-[var(--schedule-list-bg-color)]"
          >
            {/* Left: Displaying the first available employee name since teacherName is missing */}
            <div>
              <p className="text-sm font-semibold">
                {schedule.schedules.length > 0
                  ? schedule.schedules[0].Employee
                  : "Unknown Teacher"}
              </p>
              <div className="flex items-center text-sm">
                <Image
                  src={iconSrc}
                  alt="Calendar Icon"
                  width={20}
                  height={20}
                />
                <span className="ml-2">
                  {schedule.month} - {schedule.year}
                </span>
              </div>
            </div>

            {/* Right: Delete Button */}
            <button
              onClick={() => deleteMutation.mutate(schedule.id)}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              disabled={deletingScheduleId === schedule.id}
            >
              {deletingScheduleId === schedule.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withDashboardLayout(Schedule);
