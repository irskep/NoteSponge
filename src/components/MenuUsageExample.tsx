import { useEffect } from "react";
import { listenToMenuItem } from "../utils/menuEvents";

/**
 * Example component showing how to use the menu event utility
 */
export function MenuUsageExample() {
  useEffect(() => {
    // Set up menu listeners
    const cleanupFunctions: Array<() => void> = [];

    // Listen for the "format_bold" menu item
    listenToMenuItem("format_bold", () => {
      console.log("Bold formatting applied");
      // Your implementation here
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Listen for the "format_italic" menu item
    listenToMenuItem("format_italic", () => {
      console.log("Italic formatting applied");
      // Your implementation here
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Clean up when component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  return <div>{/* Component content */}</div>;
}
