import { atom } from "jotai";
import type { EditorState } from "lexical";

export const debouncedEditorStateAtom = atom<EditorState | null>(null);
