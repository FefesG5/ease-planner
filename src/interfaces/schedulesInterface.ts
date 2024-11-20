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
