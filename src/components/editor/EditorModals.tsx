import { LinkEditorDialog } from "@/components/editor/LinkEditorDialog";
import { formattingStateAtom, linkEditorStateAtom } from "@/components/editor/state/editorAtoms";
import { registerFormattingStateListeners } from "@/components/editor/state/formattingStateListeners";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function EditorModals() {
  const [editor] = useLexicalComposerContext();
  const [formattingState, setFormattingState] = useAtom(formattingStateAtom);
  const [linkEditorState, setLinkEditorState] = useAtom(linkEditorStateAtom);

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
