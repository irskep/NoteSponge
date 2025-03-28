import { editorStateStore, linkEditorStateAtom } from "@/components/editor/state/editorStore";
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
import { useSetAtom } from "jotai";
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_HIGH, type LexicalEditor, type NodeKey } from "lexical";
// Partly based on https://raw.githubusercontent.com/facebook/lexical/refs/heads/main/packages/lexical-react/src/LexicalLinkPlugin.ts
import { useEffect } from "react";

export function getNodeKeyFromDOMNode(dom: Node, editor: LexicalEditor): NodeKey | undefined {
  const prop = `__lexicalKey_${editor._key}`;
  return (dom as Node & Record<typeof prop, NodeKey | undefined>)[prop];
}

export default function CustomLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const setLinkEditorState = useSetAtom(linkEditorStateAtom, {
    store: editorStateStore,
  });

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
            editorStateStore.set(linkEditorStateAtom, {
              isOpen: true,
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
            setLinkEditorState({
              isOpen: false,
              url: "",
              text: "",
            });
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, setLinkEditorState]);

  return null;
}
