export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const dashboardNav: NavItem[] = [
  {
    href: "/access/",
    label: "Home",
    icon: "/dashboard-icon.svg",
  },
  {
    href: "/access/upload",
    label: "Upload Files",
    icon: "/upload-file-icon.svg",
  },
  {
    href: "/access/schedule",
    label: "Generate Schedule",
    icon: "/create-schedule-icon.svg",
  },
  {
    href: "/access/edit",
    label: "Review & Edit",
    icon: "/edit-schedule-icon.svg",
  },
];
