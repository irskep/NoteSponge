import { atom } from "jotai";
import type { EditorState, LexicalEditor } from "lexical";

export const debouncedEditorStateAtom = atom<EditorState | null>(null);

// Editor instance atom
export const editorAtom = atom<LexicalEditor | null>(null);
