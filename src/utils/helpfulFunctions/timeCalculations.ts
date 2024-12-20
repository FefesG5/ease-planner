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
    return "";
  }

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const [breakH, breakM] =
    breakTime && breakTime.includes(":")
      ? breakTime.split(":").map(Number)
      : [0, 0];

  let workingMinutes =
    endH * 60 + endM - (startH * 60 + startM) - (breakH * 60 + breakM);

  if (workingMinutes <= 0 || isNaN(workingMinutes)) {
    return "";
  }

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
    return "";
  }

  const [workH, workM] = workingHours.split(".").map(Number);
  const [lessonH, lessonM] = lessonHours.split(".").map(Number);

  let nonLessonMinutes = workH * 60 + workM - (lessonH * 60 + lessonM);

  if (nonLessonMinutes < 0 || isNaN(nonLessonMinutes)) {
    return "--";
  }

  const hours = Math.floor(nonLessonMinutes / 60);
  const minutes = nonLessonMinutes % 60;
  return `${hours}.${minutes.toString().padStart(2, "0")}`;
};
