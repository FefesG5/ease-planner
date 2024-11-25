// ScheduleMetadata interface used for Firestore metadata.
export interface ScheduleMetadata {
  fileType: string;
  month: string;
  name: string;
  storagePath: string;
  uploadedAt: string;
  year: string;
  signedUrl?: string;
}

// SchedulePDF interface used for schedule PDF details.
export interface SchedulePDF {
  id: string;
  name: string;
  month: string;
  year: string;
  signedUrl: string;
}

// Interface for Attendance Header Props to dynamically render year, month, school name, and teacher name in the header component.
export interface AttendanceHeaderProps {
  year: number;
  month: number;
  schoolName: string;
  teacherName: string;
}