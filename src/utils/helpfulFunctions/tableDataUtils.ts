// Define a new namespace or context-specific interfaces to avoid clashes with other files

// Interface for a single schedule entry in the fetched schedules
export interface FilteredSchedule {
  id: string;
  year: number;
  month: number;
  schedules: {
    Date: string; // e.g., "2024-12-01"
    Shift: string; // e.g., "09:00-17:00"
    School: string; // e.g., "M" or "T"
  }[];
}

// Interface for the row structure of the generated table
export interface ScheduleRow {
  Date: number; // The day of the month (1, 2, 3, ...)
  Day: string; // The full kanji representation of the day (日曜日, 月曜日, etc.)
  StartTime: string; // Start time of the shift
  EndTime: string; // End time of the shift
  BreakTime: string; // Break time during the shift
  WorkingHours: string; // Total working hours
  LessonHours: string; // Hours spent on lessons
  NonLessonHours: string; // Hours spent outside lessons
  Overtime: string; // Overtime hours
  Approval: string; // Approval status
}

// Function to generate table data based on the provided school and schedules
export const generateTableData = (
  school: string,
  schedules: FilteredSchedule[],
  fullKanjiDayMap: string[],
): ScheduleRow[] => {
  if (!schedules.length) return [];

  const selectedSchedule = schedules[0];
  const year = selectedSchedule.year;
  const month = selectedSchedule.month;

  const daysInMonth = new Date(year, month, 0).getDate();
  const existingData = selectedSchedule.schedules.filter(
    (schedule) => schedule.School === school,
  );

  const dateToScheduleMap = new Map(
    existingData.map((row) => [row.Date.replace(/\//g, "-"), row]),
  );

  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = i + 1;
    const dayKanji = fullKanjiDayMap[new Date(year, month - 1, date).getDay()];
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      date,
    ).padStart(2, "0")}`;

    const existingRow = dateToScheduleMap.get(formattedDate);

    const parsedShift = existingRow
      ? {
          StartTime: existingRow.Shift.split("-")[0],
          EndTime: existingRow.Shift.split("-")[1],
        }
      : { StartTime: "", EndTime: "" };

    return {
      Date: date,
      Day: dayKanji,
      StartTime: parsedShift.StartTime || "--:--",
      EndTime: parsedShift.EndTime || "--:--",
      BreakTime: "",
      WorkingHours: "",
      LessonHours: "",
      NonLessonHours: "",
      Overtime: "",
      Approval: "",
    };
  });
};
