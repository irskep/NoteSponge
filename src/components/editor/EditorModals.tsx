/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { LinkEditorDialog } from "./lexicalplugins/LinkEditorDialog";
import { useAtom } from "jotai";
import { linkEditorStateAtom, toolbarStateAtom } from "../../state/atoms";
import { editorStateStore } from "./state/editorStore";
import { registerToolbarStateListeners } from "./state/toolbarStateListeners";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  // Use the shared editor state store for toolbar state
  const [toolbarState, setToolbarState] = useAtom(toolbarStateAtom, {
    store: editorStateStore,
  });
  // Use the shared editor state store for link editor state
  const [linkEditorState, setLinkEditorState] = useAtom(linkEditorStateAtom, {
    store: editorStateStore,
  });

  const { storedSelection } = toolbarState;

  // const openLinkDialog = useCallback(() => {
  //   // Update stored selection in the atom
  //   updateStoredSelection(editor, setToolbarState);

  //   editor.getEditorState().read(() => {
  //     const selection = editor.getEditorState()._selection;
  //     if (!selection || selection.isCollapsed()) {
  //       setLinkEditorState({ isOpen: true, url: "", text: "" });
  //       return;
  //     }

  //     const nodes = selection.getNodes();
  //     const isCollapsed = selection.isCollapsed();
  //     const linkNode = nodes.find((node) => {
  //       const parent = node.getParent();
  //       return $isLinkNode(parent) || $isLinkNode(node);
  //     });

  //     if ($isLinkNode(linkNode)) {
  //       setLinkEditorState({
  //         isOpen: true,
  //         url: linkNode.getURL(),
  //         text: linkNode.getTextContent(),
  //       });
  //     } else if ($isLinkNode(linkNode?.getParent())) {
  //       const parentLink = linkNode.getParent() as LinkNode;
  //       setLinkEditorState({
  //         isOpen: true,
  //         url: parentLink.getURL(),
  //         text: parentLink.getTextContent(),
  //       });
  //     } else {
  //       setLinkEditorState({
  //         isOpen: true,
  //         url: "",
  //         text: isCollapsed ? "" : selection.getTextContent(),
  //       });
  //     }
  //   });
  // }, [editor, setLinkEditorState, setToolbarState]);

  useEffect(() => {
    return registerToolbarStateListeners(editor, setToolbarState);
  }, [editor, setToolbarState]);

  return (
    <LinkEditorDialog
      editor={editor}
      isOpen={linkEditorState.isOpen}
      onOpenChange={(isOpen) =>
        setLinkEditorState((prev) => ({ ...prev, isOpen }))
      }
      initialUrl={linkEditorState.url}
      initialText={linkEditorState.text}
      storedSelection={storedSelection}
    />
  );
}
