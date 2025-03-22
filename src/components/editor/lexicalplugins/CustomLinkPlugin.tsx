// Partly based on https://raw.githubusercontent.com/facebook/lexical/refs/heads/main/packages/lexical-react/src/LexicalLinkPlugin.ts
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from "lexical";
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { open } from "@tauri-apps/plugin-shell";
import { useSetAtom } from "jotai";
import { editorStateStore, linkEditorStateAtom } from "../state/editorStore";
import { mergeRegister } from "@lexical/utils";
import { listen } from "@tauri-apps/api/event";
import { openPageWindow } from "../../../services/window";

export default function CustomLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const setLinkEditorState = useSetAtom(linkEditorStateAtom, {
    store: editorStateStore,
  });

  useEffect(() => {
    if (!editor.hasNodes([LinkNode])) {
      throw new Error("CustomLinkPlugin: LinkNode not registered on editor");
    }

    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        editorElement.classList.add("meta-pressed");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        editorElement.classList.remove("meta-pressed");
      }
    };

    let unlistenBlur: (() => void) | undefined;

    // Set up Tauri blur event listener
    listen("tauri://blur", () => {
      editorElement.classList.remove("meta-pressed");
    }).then((unlisten) => {
      unlistenBlur = unlisten;
    });

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (unlistenBlur) unlistenBlur();
    };
  }, [editor, setLinkEditorState]);

  useEffect(() => {
    return mergeRegister(
      // Handle link clicks
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const linkElement = target.closest("a");

          if (!linkElement) return false;

          event.stopPropagation();

          const href = linkElement.getAttribute("href");

          if (!href) return false;

          console.log("Click", href);

          if (event.metaKey || event.ctrlKey) {
            // Check if this is an internal page link: #123 format
            const internalPageMatch = href.match(/^#(\d+)$/);
            if (internalPageMatch) {
              const pageId = parseInt(internalPageMatch[1], 10);
              if (!isNaN(pageId)) {
                // Open the internal page
                openPageWindow(pageId);
                return true;
              }
            } else {
              open(href);
            }
            return true;
          }

          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return false;

            const nodes = selection.getNodes();

            const node = nodes.find((node) => {
              const parent = node.getParent();
              return $isLinkNode(parent) || $isLinkNode(node);
            });

            if (!node) return false;

            const linkNode = $isLinkNode(node) ? node : node.getParent();
            if (!$isLinkNode(linkNode)) return false;

            // For link editing, we don't need to create a selection
            // Just store the link node info in the link editor state

            // Save the selected link data for the editor dialog
            editorStateStore.set(linkEditorStateAtom, {
              isOpen: true,
              url: linkNode.getURL(),
              text: linkNode.getTextContent(),
              linkNodeKey: linkNode.getKey(),
            });
          });

          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),

      // Handle link toggling (creation/removal)
      editor.registerCommand(
        TOGGLE_LINK_COMMAND,
        (payload) => {
          if (payload === null) {
            setLinkEditorState({
              isOpen: false,
              url: "",
              text: "",
            });
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, setLinkEditorState]);

  return null;
}
