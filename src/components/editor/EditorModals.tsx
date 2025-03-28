import { LinkEditorDialog } from "@/components/editor/LinkEditorDialog";
import { editorStateStore, formattingStateAtom, linkEditorStateAtom } from "@/components/editor/state/editorStore";
import { registerFormattingStateListeners } from "@/components/editor/state/formattingStateListeners";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function EditorModals() {
  const [editor] = useLexicalComposerContext();
  // Use the shared editor state store for toolbar state
  const [formattingState, setFormattingState] = useAtom(formattingStateAtom, {
    store: editorStateStore,
  });
  // Use the shared editor state store for link editor state
  const [linkEditorState, setLinkEditorState] = useAtom(linkEditorStateAtom, {
    store: editorStateStore,
  });

  const { storedSelection } = formattingState;

  useEffect(() => {
    return registerFormattingStateListeners(editor, setFormattingState);
  }, [editor, setFormattingState]);

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
