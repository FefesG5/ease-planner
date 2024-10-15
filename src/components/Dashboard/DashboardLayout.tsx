import Link from "next/link";
import Image from "next/image";
import UserSection from "../UserSection/UserSection";
import { User } from "firebase/auth";
import { dashboardNav } from "@/config/dashBoardNav";

type DashboardLayoutProps = {
  signOutUser: () => Promise<void>;
  user: User;
  children: React.ReactNode; // Allows embedding content inside the layout
};

const DashboardLayout = ({
  signOutUser,
  user,
  children,
}: DashboardLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* UserSection bar under the header */}
      <div className="w-full bg-white shadow-md">
        <UserSection user={user} signOutUser={signOutUser} />
      </div>

      <div className="flex flex-1">
        <nav className="p-4 shadow-md bg-[var(--sidebar-bg-hover)] w-16 md:w-64">
          <ul className="list-none p-0 m-0">
            {dashboardNav.map((item) => (
              <li className="mb-4" key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-center md:justify-start text-lg p-2 rounded text-[color:var(--nav-text-color)] hover:bg-[var(--nav-hover-bg-color)] hover:text-[var(--nav-text-hover-color)]"
                >
                  {item.icon && (
                    <Image
                      src={item.icon}
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 bg-[var(--main-content-bg-color)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
