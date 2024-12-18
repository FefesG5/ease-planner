import { useQuery } from "@tanstack/react-query";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { FilteredSchedule } from "@/interfaces/teachersShift";

function Testing() {
  const { user } = useAuthContext();

  const {
    data: filteredSchedules = [],
    isLoading,
    isError,
    error,
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

  if (isLoading) {
    return <p>Loading schedules...</p>;
  }

  if (isError) {
    return <p>Error: {error?.message}</p>;
  }

  // Console log the complete data structure for debugging
  console.log("Filtered Schedules:", filteredSchedules);

  return (
    <div>
      <h1>Testing Page</h1>
      <p>Fetched Schedules:</p>
      <ul>
        {filteredSchedules.map((schedule) => (
          <li key={schedule.id}>
            <strong>{schedule.teacherName}</strong>: {schedule.year} -{" "}
            {schedule.month}
            <pre>{JSON.stringify(schedule, null, 2)}</pre>{" "}
            {/* Display all data */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withDashboardLayout(Testing);
