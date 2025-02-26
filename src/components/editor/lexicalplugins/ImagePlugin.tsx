import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
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
import { $wrapNodeInElement } from "@lexical/utils";
import { ImageNode, $createImageNode } from "./ImageNode";

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
      editor._nodes.set("image", ImageNode);
      console.log("ImagesPlugin: Registered ImageNode with editor");
    } else {
      console.log("ImagesPlugin: ImageNode already registered");
    }
    
    console.log("ImagesPlugin: Initializing, checking ImageNode registration");

    return mergeRegister(
      editor.registerCommand<number>(
        INSERT_IMAGE_COMMAND,
        (id) => {
          console.log(`ImagesPlugin: Received INSERT_IMAGE_COMMAND with id ${id}`);
          
          // Create the image node
          const imageNode = $createImageNode(id);
          console.log(`ImagesPlugin: Created ImageNode with id ${id}`);
          
          // Get and validate the selection
          const selection = $getSelection();
          console.log(`ImagesPlugin: Current selection:`, selection);
          
          // Insert the node
          if ($isRangeSelection(selection)) {
            console.log(`ImagesPlugin: Inserting at range selection`);
            selection.insertNodes([imageNode]);
          } else {
            console.log(`ImagesPlugin: No valid selection, inserting at root`);
            $insertNodes([imageNode]);
            
            // If needed, wrap in paragraph (for block-level formatting)
            if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
              console.log(`ImagesPlugin: Wrapping in paragraph node`);
              $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
            }
          }
          
          console.log(`ImagesPlugin: Image node inserted successfully`);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor, pageId]);

  return null;
}
