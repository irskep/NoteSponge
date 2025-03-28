import { Theme } from "@radix-ui/themes";
import "@/styles/index.css";
import "@radix-ui/themes/styles.css";
import useDarkMode from "@/hooks/useDarkMode";

export default function AppTheme({ children }: { children: React.ReactNode }) {
  const theme = useDarkMode();
  return <Theme appearance={theme}>{children}</Theme>;
}
