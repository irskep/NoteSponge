import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  $isRootOrShadowRoot,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { ImageNode, $createImageNode, $isImageNode } from "./ImageNode";
import { deleteImageAttachment } from "../../../services/db/actions";

export const INSERT_IMAGE_COMMAND: LexicalCommand<number> = createCommand();

interface ImagesPluginProps {
  pageId: number;
}

export default function ImagesPlugin({
  pageId,
}: ImagesPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      // Make sure we register the ImageNode with the editor
      // editor._nodes.set("image", ImageNode);
    }

    return mergeRegister(
      editor.registerCommand<number>(
        INSERT_IMAGE_COMMAND,
        (id) => {
          // Create the image node
          const imageNode = $createImageNode(id);

          // Get and validate the selection
          const selection = $getSelection();

          // Insert the node
          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          } else {
            $insertNodes([imageNode]);

            // If needed, wrap in paragraph (for block-level formatting)
            if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
              $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
            }
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),

      // Listen for node removal events to delete images from the database
      editor.registerMutationListener(ImageNode, (mutatedNodes) => {
        // Track deleted image nodes
        for (const [nodeKey, mutation] of mutatedNodes) {
          // Only process node deletions
          if (mutation === "destroyed") {
            // Get the image ID from the editor state
            editor.getEditorState().read(() => {
              // We need to retrieve the image ID before the node is fully destroyed
              const imageNode =
                editor._pendingEditorState?._nodeMap.get(nodeKey);

              if (imageNode && $isImageNode(imageNode)) {
                const imageId = imageNode.__id;

                // Delete the image from the database
                if (imageId) {
                  deleteImageAttachment(imageId).catch((error) => {
                    console.error(
                      `Failed to delete image with ID ${imageId}:`,
                      error
                    );
                  });
                }
              }
            });
          }
        }
      })
    );
  }, [editor, pageId]);

  return null;
}
