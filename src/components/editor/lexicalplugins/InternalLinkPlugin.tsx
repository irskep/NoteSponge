import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  LexicalCommand,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { listen } from "@tauri-apps/api/event";
import { openPageWindow } from "../../../services/window";
import { InternalLinkNode } from "./InternalLinkNode";

export const INSERT_INTERNAL_LINK_COMMAND: LexicalCommand<{
  pageId: number;
}> = createCommand();

export default function InternalLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  // useEffect(() => {
  //   if (!editor.hasNodes([InternalLinkNode])) {
  //     throw new Error(
  //       "InternalLinkPlugin: InternalLinkNode not registered on editor"
  //     );
  //   }

  //   const editorElement = editor.getRootElement();
  //   if (!editorElement) return;

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Meta") {
  //       editorElement.classList.add("meta-pressed");
  //     }
  //   };

  //   const handleKeyUp = (e: KeyboardEvent) => {
  //     if (e.key === "Meta") {
  //       editorElement.classList.remove("meta-pressed");
  //     }
  //   };

  //   let unlistenBlur: (() => void) | undefined;

  //   // Set up Tauri blur event listener
  //   listen("tauri://blur", () => {
  //     editorElement.classList.remove("meta-pressed");
  //   }).then((unlisten) => {
  //     unlistenBlur = unlisten;
  //   });

  //   window.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("keyup", handleKeyUp);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //     if (unlistenBlur) unlistenBlur();
  //   };
  // }, [editor]);

  useEffect(() => {
    return mergeRegister(
      // Handle link clicks
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const linkElement = target.closest(".InternalLinkNode");

          if (!linkElement) return false;

          event.stopPropagation();

          // Find the closest span with data-lexical-decorator="true"
          const decoratorElement = target.closest(
            'span[data-lexical-decorator="true"]'
          );
          if (!decoratorElement) return false;

          // Get the pageId from the DatabasePageLink component's parent
          const pageId = decoratorElement.getAttribute("data-lexical-page-id");
          if (!pageId) return false;

          if (!event.metaKey && !event.ctrlKey) {
            // Open the internal page
            openPageWindow(parseInt(pageId, 10));
            return true;
          }

          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor]);

  return null;
}
