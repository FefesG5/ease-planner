import { ScheduleData } from "@/interfaces/schedulesInterface";

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
  month: number
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
      day
    ).padStart(2, "0")}`;

    // Find matching entry in school data
    const firebaseEntry = schoolData.find(
      (entry) => entry.Date === formattedDate
    );

    if (firebaseEntry) {
      // Split shift time using either "~" or "-"
      const [startTime, endTime] = firebaseEntry.Shift.includes("~")
        ? firebaseEntry.Shift.split("~")
        : firebaseEntry.Shift.split("-");

      // Populate with existing schedule data
      fullData.push({
        Employee: firebaseEntry.Employee,
        Date: day.toString(),
        Day: daysOfWeek[dayOfWeek],
        School: firebaseEntry.School,
        StartTime: startTime.trim(),
        EndTime: endTime.trim(),
        Overtime: "",
        BreakTime: "",
        WorkingHours: "",
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
