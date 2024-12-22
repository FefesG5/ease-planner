export const calculateTotalWorkingHours = (
  startTime: string,
  endTime: string,
  breakTime: string,
): string => {
  if (
    !startTime ||
    !endTime ||
    !startTime.includes(":") ||
    !endTime.includes(":")
  ) {
    return ""; // Invalid input returns empty string
  }

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const [breakH, breakM] =
    breakTime && breakTime.includes(":")
      ? breakTime.split(":").map(Number)
      : [0, 0]; // Default to 0 if break time is empty

  let workingMinutes =
    endH * 60 + endM - (startH * 60 + startM) - (breakH * 60 + breakM);

  if (workingMinutes <= 0 || isNaN(workingMinutes)) {
    return ""; // Invalid or negative time returns empty
  }

  const maxWorkingMinutes = 8 * 60; // 8 hours max
  workingMinutes = Math.min(workingMinutes, maxWorkingMinutes);

  const hours = Math.floor(workingMinutes / 60);
  const minutes = workingMinutes % 60;
  return `${hours}.${minutes.toString().padStart(2, "0")}`;
};

export const calculateNonLessonHours = (
  workingHours: string,
  lessonHours: string,
): string => {
  if (
    !workingHours ||
    !lessonHours ||
    !workingHours.includes(".") ||
    !lessonHours.includes(".")
  ) {
    return ""; // Placeholder if values are missing
  }

  // Parse working hours and lesson hours into hours and minutes
  const [workH, workM] = workingHours.split(".").map(Number);
  const [lessonH, lessonM] = lessonHours.split(".").map(Number);

  // Convert both working and lesson hours into total minutes
  const totalWorkingMinutes = workH * 60 + workM * 6; // Decimal minutes converted to base 60
  const totalLessonMinutes = lessonH * 60 + lessonM * 6;

  // Calculate the difference in minutes
  let nonLessonMinutes = totalWorkingMinutes - totalLessonMinutes;

  if (nonLessonMinutes < 0 || isNaN(nonLessonMinutes)) {
    return ""; // Handle invalid or negative values
  }

  // Convert minutes back to decimal hours
  const hours = Math.floor(nonLessonMinutes / 60);
  const minutes = nonLessonMinutes % 60;

  // Return the result in decimal hours format
  return `${(hours + minutes / 60).toFixed(2)}`;
};
