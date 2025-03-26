/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { LinkEditorDialog } from "./LinkEditorDialog";
import { useAtom } from "jotai";
import {
  editorStateStore,
  linkEditorStateAtom,
  toolbarStateAtom,
} from "./state/editorStore";
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
      linkNodeKey={linkEditorState.linkNodeKey}
    />
  );
}
