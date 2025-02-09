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

  // Parse break time: support both "HH:MM" and decimal hour formats (e.g., "1.0")
  let breakMinutes = 0;
  if (breakTime) {
    if (breakTime.includes(":")) {
      const [breakH, breakM] = breakTime.split(":").map(Number);
      breakMinutes = breakH * 60 + breakM;
    } else {
      breakMinutes = Number(breakTime) * 60;
    }
  }

  let workingMinutes = endH * 60 + endM - (startH * 60 + startM) - breakMinutes;

  if (workingMinutes <= 0 || isNaN(workingMinutes)) {
    return ""; // Invalid or negative time returns empty
  }

  // Return working hours as a decimal string (e.g., "8.17" for 8 hours 10 minutes)
  return (workingMinutes / 60).toFixed(2);
};

export const calculateNonLessonHours = (
  workingHours: string,
  lessonHours: string,
): string => {
  if (!workingHours || !lessonHours) {
    return ""; // Placeholder if values are missing
  }

  // Convert the decimal hour strings back to minutes
  const totalWorkingMinutes = Number(workingHours) * 60;
  const totalLessonMinutes = Number(lessonHours) * 60;

  let nonLessonMinutes = totalWorkingMinutes - totalLessonMinutes;

  if (nonLessonMinutes < 0 || isNaN(nonLessonMinutes)) {
    return ""; // Handle invalid or negative values
  }

  // Convert minutes back to a decimal hours string
  return (nonLessonMinutes / 60).toFixed(2);
};
