export interface TeachersShift {
  Employee: string;
  Date: string;
  Day: string;
  School: string;
  Shift: string;
}

export interface FilteredSchedule {
  id: string;
  month: number;
  year: number;
  generatedAt: string;
  teacherName: string;
  schedules: TeachersShift[];
}
