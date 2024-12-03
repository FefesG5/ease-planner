import { ScheduleData } from "@/interfaces/schedulesInterface";

/**
 * Helper function to calculate time difference in hours.
 * @param startTime - Start time in "HH:mm" format.
 * @param endTime - End time in "HH:mm" format.
 * @returns Number of hours between start and end times, accounting for breaks.
 */
function calculateWorkingHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let start = new Date();
  start.setHours(startHour, startMinute, 0, 0);

  let end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  const diffMs = end.getTime() - start.getTime();
  let diffHours = diffMs / (1000 * 60 * 60);

  // Subtract 1 hour for breaks if shift is 9 hours or more
  if (diffHours >= 9) {
    diffHours -= 1;
  }

  // Cap working hours at 8 hours max
  if (diffHours > 8) {
    diffHours = 8;
  }

  return diffHours;
}

/**
 * Generates a full month of schedule data.
 * @param schoolData - Array of schedule entries for a specific school.
 * @param year - The year for the schedule (e.g., 2024).
 * @param month - The month for the schedule (1 = January, 12 = December).
 * @returns Array of schedule data for the entire month.
 */
export function generateFullMonthData(
  schoolData: {
    Employee: string;
    Date: string; // Format: "YYYY/MM/DD"
    Day: string;
    School: string;
    Shift: string;
  }[],
  year: number,
  month: number,
): ScheduleData[] {
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

  // Get the total number of days in the given month and year
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-indexed for this calculation

  for (let day = 1; day <= daysInMonth; day++) {
    // Create a date object for the current day
    const currentDate = new Date(year, month - 1, day); // month is 0-indexed for Date
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Format date as "YYYY/MM/DD" for comparison
    const formattedDate = `${year}/${String(month).padStart(2, "0")}/${String(
      day,
    ).padStart(2, "0")}`;

    // Find matching entry in school data
    const firebaseEntry = schoolData.find(
      (entry) => entry.Date === formattedDate,
    );

    if (firebaseEntry) {
      // Split shift time using either "~" or "-"
      const [startTime, endTime] = firebaseEntry.Shift.includes("~")
        ? firebaseEntry.Shift.split("~")
        : firebaseEntry.Shift.split("-");

      const trimmedStartTime = startTime.trim();
      const trimmedEndTime = endTime.trim();

      // Calculate working hours
      const workingHours = calculateWorkingHours(
        trimmedStartTime,
        trimmedEndTime,
      );

      // Populate with existing schedule data
      fullData.push({
        Employee: firebaseEntry.Employee,
        Date: day.toString(),
        Day: daysOfWeek[dayOfWeek],
        School: firebaseEntry.School,
        StartTime: trimmedStartTime,
        EndTime: trimmedEndTime,
        Overtime: "",
        BreakTime: "",
        WorkingHours: workingHours > 0 ? workingHours.toFixed(2) : "",
        LessonHours: "",
        NonLessonHours: "",
        Approval: "",
      });
    } else {
      // Populate with empty data for dates without a schedule
      fullData.push({
        Employee: "",
        Date: day.toString(),
        Day: daysOfWeek[dayOfWeek],
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
}
