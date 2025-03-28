import { useEffect, useState } from "react";

/**
 * React hook to detect system color scheme preference
 * @returns 'light' or 'dark' based on system preference
 */
export function useSystemTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light",
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return theme;
}

export default useSystemTheme;
