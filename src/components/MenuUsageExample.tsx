import { useEffect } from "react";
import { listenToMenuItem } from "@/utils/listenToMenuItem";

/**
 * Example component showing how to use the menu event utility
 */
export function MenuUsageExample() {
  useEffect(() => {
    // Set up menu listeners
    const cleanupFunctions: Array<() => void> = [];

    // Listen for the "format_bold" menu item
    const boldCleanup = listenToMenuItem("format_bold", () => {
      console.log("Bold formatting applied");
      // Your implementation here
    });
    cleanupFunctions.push(boldCleanup);

    // Listen for the "format_italic" menu item
    const italicCleanup = listenToMenuItem("format_italic", () => {
      console.log("Italic formatting applied");
      // Your implementation here
    });
    cleanupFunctions.push(italicCleanup);

    // Clean up when component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  return <div>{/* Component content */}</div>;
}
