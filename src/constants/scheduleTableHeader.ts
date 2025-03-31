export type ScheduleTableHeading = {
  label: string;
  icon: {
    light: string;
    dark: string;
  };
  hideOnMobile?: boolean;
};

export const scheduleTableHeadings: ScheduleTableHeading[] = [
  {
    label: "Date",
    icon: {
      light: "/date-icon.svg",
      dark: "/date-icon-white.svg",
    },
  },
  {
    label: "Day",
    icon: {
      light: "/day-icon.svg",
      dark: "/day-icon-white.svg",
    },
  },
  {
    label: "Start Time",
    icon: {
      light: "/starting-time-icon.svg",
      dark: "/starting-time-icon-white.svg",
    },
  },
  {
    label: "End Time",
    icon: {
      light: "/finishing-time-icon.svg",
      dark: "/finishing-time-icon-white.svg",
    },
  },
  {
    label: "Overtime",
    icon: {
      light: "/overtime-icon.svg",
      dark: "/overtime-icon-white.svg",
    },
  },
  {
    label: "Break Time",
    icon: {
      light: "/break-time-icon.svg",
      dark: "/break-time-icon-white.svg",
    },
  },
  {
    label: "Working Hours",
    icon: {
      light: "/working-hours-icon.svg",
      dark: "/working-hours-icon.svg",
    },
  },
  {
    label: "Lesson Hours",
    icon: {
      light: "/lesson-hours-icon.svg",
      dark: "/lesson-hours-icon.svg",
    },
  },
  {
    label: "Non-Lesson Hours",
    icon: {
      light: "/non-lesson-hours-icon.svg",
      dark: "/non-lesson-hours-icon.svg",
    },
  },
  {
    label: "Approval",
    icon: {
      light: "/approved-icon.svg",
      dark: "/approved-icon.svg",
    },
    hideOnMobile: true,
  },
];
