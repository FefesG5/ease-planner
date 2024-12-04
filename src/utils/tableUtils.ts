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
