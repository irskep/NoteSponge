import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $createRangeSelection,
  $setSelection,
  $isRangeSelection,
  $getNodeByKey,
} from "lexical";

/**
 * Plugin that preserves cursor position when editor loses focus and regains it
 */
export default function FocusPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const lastSelectionRef = useRef<{
    anchorKey: string;
    anchorOffset: number;
    focusKey: string;
    focusOffset: number;
    type: "text" | "element";
  } | null>(null);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleBlur = () => {
      // Save the current selection when editor loses focus
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Store the selection type as well
          lastSelectionRef.current = {
            anchorKey: selection.anchor.key,
            anchorOffset: selection.anchor.offset,
            focusKey: selection.focus.key,
            focusOffset: selection.focus.offset,
            type: selection.anchor.type,
          };
        }
      });
    };

    const handleFocus = () => {
      // Restore the selection when editor regains focus
      const lastSelection = lastSelectionRef.current;
      if (lastSelection) {
        try {
          editor.update(() => {
            try {
              // Check if the nodes still exist in the editor
              const anchorNode = $getNodeByKey(lastSelection.anchorKey);
              const focusNode = $getNodeByKey(lastSelection.focusKey);

              if (anchorNode && focusNode) {
                const selection = $createRangeSelection();
                selection.anchor.key = lastSelection.anchorKey;
                selection.anchor.offset = lastSelection.anchorOffset;
                selection.focus.key = lastSelection.focusKey;
                selection.focus.offset = lastSelection.focusOffset;
                selection.anchor.type = lastSelection.type;
                selection.focus.type = lastSelection.type;
                $setSelection(selection);
              }
            } catch (error) {
              // If anything goes wrong inside the update, log it but don't throw
              console.warn("Error restoring selection:", error);
            }
          });
        } catch (error) {
          // If the update itself fails, log it
          console.warn("Failed to update editor with selection:", error);
        }
      }
    };

    // Add event listeners
    rootElement.addEventListener("blur", handleBlur);
    rootElement.addEventListener("focus", handleFocus);

    // Clean up
    return () => {
      rootElement.removeEventListener("blur", handleBlur);
      rootElement.removeEventListener("focus", handleFocus);
    };
  }, [editor]);

  return null;
}
