import { ScheduleData } from "@/interfaces/schedulesInterface";

export function autofillBreakTime(
  tableData: ScheduleData[],
  breakTimeValue: string | null,
): ScheduleData[] {
  const parsedBreakTime = parseFloat(breakTimeValue || "0"); // Default to "0" if null
  return tableData.map((row) => {
    if (row.StartTime && row.EndTime) {
      return {
        ...row,
        BreakTime: parsedBreakTime.toFixed(1), // Update BreakTime
      };
    }
    return row; // Leave rows without StartTime/EndTime unchanged
  });
}

export function autofillLessonHours(
  tableData: ScheduleData[],
  lessonHoursValue: string | null,
): ScheduleData[] {
  const parsedLessonHours = parseFloat(lessonHoursValue || "0"); // Default to "0" if null
  return tableData.map((row) => {
    const workingHours = parseFloat(row.WorkingHours) || 0;
    if (workingHours > 0) {
      const nonLessonHours = workingHours - parsedLessonHours;
      return {
        ...row,
        LessonHours: parsedLessonHours.toFixed(2), // Update LessonHours
        NonLessonHours: nonLessonHours.toFixed(2), // Update NonLessonHours
      };
    }
    return row; // Leave rows with no WorkingHours unchanged
  });
}
