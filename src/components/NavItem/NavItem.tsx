import Link from "next/link";

interface NavItemProps {
  href: string;
  label: string;
  variant: "header" | "sidebar";
  closeSidebar?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  label,
  variant,
  closeSidebar,
}) => {
  // Define the Tailwind styles for each variant
  const getClassName = () => {
    switch (variant) {
      case "header":
        return "px-3 py-1 mx-2 text-base hover:text-blue-500 transition duration-200 ease-in-out";
      case "sidebar":
        return "block px-6 py-4 text-lg font-medium border-b transition-all duration-300 ease-in-out";
      default:
        return "";
    }
  };

  return (
    <li className={getClassName()} onClick={closeSidebar}>
      <Link data-testid={`nav-${label.toLowerCase()}`} href={href}>
        {label}
      </Link>
    </li>
  );
};

export default NavItem;
