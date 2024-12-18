// utils/tableCalculations.ts
import { ScheduleData } from "@/interfaces/schedulesInterface";
import { calculateWorkingHours } from "./generateFullMonthData";

/**
 * Recalculates WorkingHours and NonLessonHours based on StartTime and EndTime.
 * If either time is missing, resets the calculated fields.
 */
export function updateRowCalculations(
  row: ScheduleData,
  newStartTime?: string,
  newEndTime?: string,
): ScheduleData {
  const updatedRow = { ...row };

  if (newStartTime !== undefined) updatedRow.StartTime = newStartTime;
  if (newEndTime !== undefined) updatedRow.EndTime = newEndTime;

  if (updatedRow.StartTime && updatedRow.EndTime) {
    const workingHours = calculateWorkingHours(
      updatedRow.StartTime,
      updatedRow.EndTime,
    );
    updatedRow.WorkingHours = workingHours > 0 ? workingHours.toFixed(2) : "";
    const lessonHours = parseFloat(updatedRow.LessonHours || "0");
    updatedRow.NonLessonHours =
      workingHours > 0 ? (workingHours - lessonHours).toFixed(2) : "";
  } else {
    // Reset calculated fields if StartTime or EndTime is missing
    updatedRow.WorkingHours = "";
    updatedRow.NonLessonHours = "";
  }

  return updatedRow;
}
