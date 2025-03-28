import { LinkEditorDialog } from "@/components/editor/LinkEditorDialog";
import { editorStateStore, linkEditorStateAtom, toolbarStateAtom } from "@/components/editor/state/editorStore";
import { registerToolbarStateListeners } from "@/components/editor/state/toolbarStateListeners";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function EditorModals() {
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
      onOpenChange={(isOpen) => setLinkEditorState((prev) => ({ ...prev, isOpen }))}
      initialUrl={linkEditorState.url}
      initialText={linkEditorState.text}
      storedSelection={storedSelection}
      linkNodeKey={linkEditorState.linkNodeKey}
    />
  );
}
