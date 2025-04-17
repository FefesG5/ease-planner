import { useState, useRef, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/Spinner/Spinner";
import FloatingNotification from "@/components/FloatingNotification/FloatingNotification";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { FilteredSchedule } from "@/interfaces/teachersShift";
import { ThemeContext } from "@/contexts/ThemeContext";
import Image from "next/image";

// Define NotificationType
type NotificationType = "success" | "error" | "info" | null;

function Schedule() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Immediately bail if no user
  const userId = user!.uid;

  // Track which schedule is being deleted
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(
    null,
  );

  // Notification state & timeout
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Theme for icon
  const { theme } = useContext(ThemeContext);
  const iconSrc =
    theme === "dark" ? "/calendar-icon-white.svg" : "/calendar-icon.svg";

  // ===== authFetch helper =====
  async function authFetch(
    path: string,
    opts: RequestInit = {},
  ): Promise<Response> {
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();
    return fetch(path, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });
  }

  // ===== showNotification helper =====
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 5000);
  };

  // ===== Fetch schedules =====
  const {
    data: schedules = [],
    isLoading,
    error,
  } = useQuery<FilteredSchedule[], Error>({
    queryKey: ["filteredSchedules", userId],
    enabled: !!user,
    queryFn: async () => {
      const res = await authFetch(
        `/api/schedules/getFilteredSchedulesByUser?userId=${userId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fire an error notification if fetch fails
  useEffect(() => {
    if (error instanceof Error) {
      showNotification(error.message, "error");
    }
  }, [error]);

  // ===== Delete mutation =====
  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      setDeletingScheduleId(scheduleId);
      const res = await authFetch("/api/schedules/deleteSchedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, userId }),
      });
      if (!res.ok) throw new Error("Failed to delete schedule.");
    },
    onSuccess: () => {
      setDeletingScheduleId(null);
      queryClient.invalidateQueries({
        queryKey: ["filteredSchedules", userId],
      });
      showNotification("Schedule deleted successfully!", "success");
    },
    onError: () => {
      setDeletingScheduleId(null);
      showNotification("Failed to delete schedule.", "error");
    },
  });

  // ===== Loading & error states =====
  if (isLoading) return <Spinner />;
  if (error) return <p className="text-center text-red-500">{error.message}</p>;

  // ===== Render =====
  return (
    <div className="p-4 bg-[var(--user-section-bg-color)] min-h-screen">
      <h1 className="text-base font-bold text-center mb-1">
        GENERATED SCHEDULES
      </h1>

      {/* Floating notification */}
      {notification && (
        <FloatingNotification
          message={notification.message}
          type={notification.type!}
        />
      )}

      <ul className="space-y-4">
        {schedules.map((schedule) => (
          <li
            key={schedule.id}
            className="border p-2 flex justify-between items-center shadow bg-[var(--schedule-list-bg-color)]"
          >
            {/* Left: Teacher name + date */}
            <div>
              <p className="text-sm font-semibold">
                {schedule.schedules[0]?.Employee ?? "Unknown Teacher"}
              </p>
              <div className="flex items-center text-sm">
                <Image
                  src={iconSrc}
                  alt="Calendar Icon"
                  width={20}
                  height={20}
                />
                <span className="ml-2">
                  {schedule.month} – {schedule.year}
                </span>
              </div>
            </div>

            {/* Right: Delete button */}
            <button
              onClick={() => deleteMutation.mutate(schedule.id)}
              disabled={deletingScheduleId === schedule.id}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
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
