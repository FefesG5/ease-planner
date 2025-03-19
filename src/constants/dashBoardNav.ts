export type NavItem = {
  href: string;
  label: string;
  icon: {
    light: string;
    dark: string;
  };
};

export const dashboardNav: NavItem[] = [
  {
    href: "/dashboard/",
    label: "Home",
    icon: {
      light: "/dashboard-icon.svg",
      dark: "/dashboard-icon-white.svg",
    },
  },
  {
    href: "/dashboard/schedule",
    label: "Generate Schedule",
    icon: {
      light: "/create-schedule-icon.svg",
      dark: "/create-schedule-icon-white.svg",
    },
  },
  {
    href: "/dashboard/edit",
    label: "Review & Edit",
    icon: {
      light: "/edit-schedule-icon.svg",
      dark: "/edit-schedule-icon-white.svg",
    },
  },
  {
    href: "/dashboard/parse-schedule",
    label: "Parse Schedule",
    icon: {
      light: "/parse-schedule-icon.svg",
      dark: "/parse-schedule-icon-white.svg",
    },
  },
  {
    href: "/dashboard/upload",
    label: "Upload File",
    icon: {
      light: "/upload-file-icon.svg",
      dark: "/upload-file-icon-white.svg",
    },
  },
  {
    href: "/dashboard/help",
    label: "Help",
    icon: {
      light: "/help-icon.svg",
      dark: "/help-icon-white.svg",
    },
  },
  {
    href: "/dashboard/testing",
    label: "Testing",
    icon: {
      light: "/testing-icon.svg",
      dark: "/testing-icon.svg",
    },
  },
];
