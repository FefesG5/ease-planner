import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";
import Link from "next/link";
import Image from "next/image";
import UserSection from "../UserSection/UserSection";
import { User } from "firebase/auth";
import { dashboardNav } from "@/constants/dashBoardNav";

type DashboardLayoutProps = {
  signOutUser: () => Promise<void>;
  user: User;
  children: React.ReactNode;
};

const DashboardLayout = ({
  signOutUser,
  user,
  children,
}: DashboardLayoutProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full bg-white shadow-md">
        <UserSection user={user} signOutUser={signOutUser} />
      </div>

      <div className="flex flex-1">
        <nav className="p-2 shadow-md bg-[var(--sidebar-bg-hover)] w-16 md:w-64">
          <ul className="list-none p-0 m-0">
            {dashboardNav.map((item) => (
              <li className="mb-4" key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-center md:justify-start text-lg p-2 rounded text-[color:var(--nav-text-color)] hover:bg-[var(--nav-hover-bg-color)] hover:text-[var(--nav-text-hover-color)]"
                  title={item.label}
                >
                  {item.icon && (
                    <Image
                      src={theme === "dark" ? item.icon.dark : item.icon.light}
                      alt={`${item.label} icon`}
                      width={24}
                      height={24}
                      className="md:mr-2"
                    />
                  )}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content area */}
        <main className="flex-1 p-0">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
