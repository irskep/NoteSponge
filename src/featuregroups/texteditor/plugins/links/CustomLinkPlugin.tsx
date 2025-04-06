import { type LinkEditorState, linkEditorStateAtom, openModalsAtom } from "@/state/modalState";
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
import { getDefaultStore } from "jotai";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  type LexicalEditor,
  type NodeKey,
} from "lexical";
// Partly based on https://raw.githubusercontent.com/facebook/lexical/refs/heads/main/packages/lexical-react/src/LexicalLinkPlugin.ts
import { useEffect } from "react";
import { OPEN_LINK_EDITOR_COMMAND } from "./commands";

export function getNodeKeyFromDOMNode(dom: Node, editor: LexicalEditor): NodeKey | undefined {
  const prop = `__lexicalKey_${editor._key}`;
  return (dom as Node & Record<typeof prop, NodeKey | undefined>)[prop];
}

export default function CustomLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  // Apply .meta-pressed class to the editor when the Meta key is pressed
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
  }, [editor]);

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

          if (event.metaKey || event.ctrlKey) {
            // Only handle external links now
            open(href);
            return true;
          }

          const linkNodeKey = getNodeKeyFromDOMNode(linkElement, editor);

          if (!linkNodeKey) {
            console.error("Link node key not found: ", linkNodeKey, linkElement);
            return false;
          }

          editor.update(() => {
            const linkNode = $getNodeByKey(linkNodeKey);
            if (!$isLinkNode(linkNode)) return false;

            // Begin editing this link
            openEditLinkModal({
              url: linkNode.getURL(),
              text: linkNode.getTextContent(),
              linkNodeKey: linkNode.getKey(),
            });
          });

          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),

      // Handle link toggling (creation/removal)
      editor.registerCommand(
        TOGGLE_LINK_COMMAND,
        (payload) => {
          if (payload === null) {
            openEditLinkModal({ url: "", text: "" });
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),

      // Handle link editor opening
      editor.registerCommand(
        OPEN_LINK_EDITOR_COMMAND,
        () => {
          editor.update(() => {
            const selection = $getSelection();
            if (!selection || (selection && $isRangeSelection(selection) && selection.isCollapsed())) {
              openEditLinkModal({ url: "", text: "" });
              return;
            }

            if (!$isRangeSelection(selection)) {
              return;
            }

            const nodes = selection.getNodes();
            const isCollapsed = selection.isCollapsed();
            const linkNode = nodes.find((node) => {
              const parent = node.getParent();
              return $isLinkNode(parent) || $isLinkNode(node);
            });

            if ($isLinkNode(linkNode)) {
              openEditLinkModal({
                url: linkNode.getURL(),
                text: linkNode.getTextContent(),
              });
            } else if ($isLinkNode(linkNode?.getParent())) {
              const parentLink = linkNode.getParent() as LinkNode;
              openEditLinkModal({
                url: parentLink.getURL(),
                text: parentLink.getTextContent(),
              });
            } else {
              openEditLinkModal({
                url: isCollapsed ? "" : selection.getTextContent(),
                text: isCollapsed ? "" : selection.getTextContent(),
              });
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}

function openEditLinkModal(state: LinkEditorState) {
  const store = getDefaultStore();
  store.set(linkEditorStateAtom, state);
  store.set(openModalsAtom, (prev) => ({ ...prev, linkEditor: true }));
}
