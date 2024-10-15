import {
  useState,
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";

// Define the shape of the context data
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// Create the context with a default value and type
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Synchronize theme with local storage and media query preference after mount
  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(storedTheme);
  }, []);

  // Effect for applying the theme and persisting it
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  const contextValue = useMemo(
    () => ({ theme, toggleTheme }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
