import Image from "next/image";
import { useContext } from "react";
import { inter, poppins, roboto, cabin } from "@/app/ui/fonts";
import { ThemeContext } from "@/contexts/ThemeContext";

const Footer: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <footer className="w-full py-3 flex justify-center items-center text-center text-gray-700 bg-[var(--footer-bg-color)]">
      <div>
        <span
          className={`${poppins.className} text-sm mr-2 text-[color:var(--body-text-color)]`}
        >
          Powered by
        </span>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <span className="ml-2">
            <Image
              src={
                theme === "dark" ? "/vercel-logo-white.svg" : "/vercel-logo.svg"
              }
              alt="Vercel Logo"
              width={71}
              height={16}
            />
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
