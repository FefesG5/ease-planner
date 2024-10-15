import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "../Sidebar/Sidebar";
import NavItem from "../NavItem/NavItem";
import { navigationLinks } from "../../config/navigationLinks";
import { ThemeContext } from "@/contexts/ThemeContext";
import { poppins } from "@/app/ui/fonts";

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Toggle the sidebar state
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Add event listener to handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // If the screen is large (lg and above), automatically close the sidebar
        setIsSidebarOpen(false);
      }
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header
      className={`${poppins.className} flex items-center justify-between py-6 px-6 shadow-md bg-[var(--header-bg-color)]`}
    >
      {/* Logo Container */}
      <div>
        <Link href="/">
          <Image src="/next.svg" alt="Next.js Logo" width={128} height={64} />
        </Link>
      </div>

      {/* Hamburger Icon for Smaller Screens */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-[var(--body-text-color)]"
      >
        <Image src="/menu-icon.svg" alt="Menu Icon" width={24} height={24} />
      </button>

      {/* Sidebar rendering */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-40 lg:hidden">
          {/* Sidebar component */}
          <div className="fixed top-0 left-0 h-full w-64">
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
          </div>
        </div>
      )}

      {/* Navigation - Visible only on large screens */}
      <nav className="hidden lg:flex justify-end items-center w-full">
        <ul className="flex list-none p-0 m-0 ml-auto">
          {/* Navigation Items */}
          {navigationLinks.map((nav) => (
            <NavItem
              key={nav.href}
              href={nav.href}
              label={nav.label}
              variant="header"
              closeSidebar={closeSidebar}
            />
          ))}
        </ul>
      </nav>

      {/* Theme Changer Button - Visible only on large screens */}
      <button
        onClick={toggleTheme}
        className="hidden lg:block bg-transparent cursor-pointer"
      >
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button>
    </header>
  );
};

export default Header;
