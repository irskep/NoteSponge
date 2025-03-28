import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

/**
 * Handles special cases where Lexical eats keyboard events that we want Tauri to handle
 */
export default function KeyboardHandlerPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Function to handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Shift+B (bullet list)
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "b") {
        // Prevent default behavior (which would be bold)
        // event.preventDefault();
        event.stopPropagation();
      }

      // Check for Cmd+Shift+N (numbered list)
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "n") {
        // Prevent default behavior
        // event.preventDefault();
        event.stopPropagation();
      }
    };

    // Add event listener to the editor root element
    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener("keydown", handleKeyDown, true);
    }

    // Clean up
    return () => {
      if (rootElement) {
        rootElement.removeEventListener("keydown", handleKeyDown, true);
      }
    };
  }, [editor]);

  return null;
}
