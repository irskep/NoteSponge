import {
  $createInternalLinkNode,
  $isInternalLinkNode,
} from "@/featuregroups/texteditor/plugins/internallink/InternalLinkNode";
import { navigateToPage } from "@/services/windowRouting";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";
import { INSERT_INTERNAL_LINK_COMMAND } from "./commands";

export default function InternalLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Handle internal link insertion command
      editor.registerCommand(
        INSERT_INTERNAL_LINK_COMMAND,
        ({ pageId }) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              // Delete any selected text first
              selection.removeText();

              // Insert the internal link node
              const linkNode = $createInternalLinkNode(pageId);
              selection.insertNodes([linkNode]);
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),

      // Handle link clicks
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const linkElement = target.closest(".InternalLinkNode");

          if (!linkElement) return false;

          event.stopPropagation();

          // Find the closest span with data-lexical-decorator="true"
          const decoratorElement = target.closest('span[data-lexical-decorator="true"]');
          if (!decoratorElement) return false;

          // Get the pageId from the DatabasePageLink component's parent
          const pageId = decoratorElement.getAttribute("data-lexical-page-id");
          if (!pageId) return false;

          if (!event.metaKey && !event.ctrlKey) {
            // Open the internal page
            navigateToPage(Number.parseInt(pageId, 10));
            return true;
          }

          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),

      // Handle backspace to delete internal link node
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        () => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }

          const anchorNode = selection.anchor.getNode();
          const anchorOffset = selection.anchor.offset;

          // Special case: if the anchorNode is a paragraph and contains just one InternalLinkNode
          if ($isParagraphNode(anchorNode)) {
            const children = anchorNode.getChildren();

            // If the paragraph has only one child and it's an InternalLinkNode
            if (anchorOffset <= children.length && $isInternalLinkNode(children[anchorOffset - 1])) {
              children[anchorOffset - 1].remove();
              return true;
            }
          }

          // Only handle when at the beginning of a node
          if (anchorOffset !== 0) {
            return false;
          }

          // Check if previous node/sibling is an InternalLinkNode
          const previousNode = anchorNode.getPreviousSibling();

          if (previousNode && $isInternalLinkNode(previousNode)) {
            // Remove the internal link node
            previousNode.remove();
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),

      // Handle paste events for [[number]] syntax
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const clipboardData = event instanceof ClipboardEvent ? event.clipboardData : null;

          if (!clipboardData) return false;

          const text = clipboardData.getData("text/plain");
          const match = text.match(/^\[\[(\d+)\]\]$/);

          if (match) {
            // Prevent default paste behavior
            event.preventDefault();

            const pageId = Number.parseInt(match[1], 10);

            // Reuse our insert link command
            editor.dispatchCommand(INSERT_INTERNAL_LINK_COMMAND, { pageId });
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}
