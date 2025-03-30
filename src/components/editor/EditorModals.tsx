import { LinkEditorDialog } from "@/components/editor/LinkEditorDialog";
import { registerFormattingStateListeners } from "@/components/editor/state/formattingStateListeners";
import { formattingStateAtom } from "@/state/editorState";
import { linkEditorStateAtom, openModalsAtom } from "@/state/modalState";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

export default function EditorModals() {
  const [editor] = useLexicalComposerContext();
  const [formattingState, setFormattingState] = useAtom(formattingStateAtom);
  const [linkEditorState, setLinkEditorState] = useAtom(linkEditorStateAtom);
  const openModals = useAtomValue(openModalsAtom);

  const { storedSelection } = formattingState;

  useEffect(() => {
    return registerFormattingStateListeners(editor, setFormattingState);
  }, [editor, setFormattingState]);

  return (
    <LinkEditorDialog
      editor={editor}
      isOpen={openModals.linkEditor}
      onOpenChange={(isOpen) => setLinkEditorState((prev) => ({ ...prev, isOpen }))}
      initialUrl={linkEditorState.url}
      initialText={linkEditorState.text}
      storedSelection={storedSelection}
      linkNodeKey={linkEditorState.linkNodeKey}
    />
  );
}
