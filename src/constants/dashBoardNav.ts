export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const dashboardNav: NavItem[] = [
  {
    href: "/dashboard/",
    label: "Home",
    icon: "/dashboard-icon.svg",
  },
  {
    href: "/dashboard/schedule",
    label: "Generate Schedule",
    icon: "/create-schedule-icon.svg",
  },
  {
    href: "/dashboard/edit",
    label: "Review & Edit",
    icon: "/edit-schedule-icon.svg",
  },
  {
    href: "/dashboard/parse-schedule",
    label: "Parse Schedule",
    icon: "/parse-schedule-icon.svg",
  },
  {
    href: "/dashboard/upload",
    label: "Upload File",
    icon: "/upload-file-icon.svg",
  },
  {
    href: "/dashboard/help",
    label: "Help",
    icon: "/help-icon.svg",
  },
  {
    href: "/dashboard/testing",
    label: "Testing",
    icon: "/testing-icon.svg",
  },
];
