import { atom } from "jotai";
import type { $getSelection } from "lexical";

// For link editor state
export interface LinkEditorState {
  isOpen: boolean;
  url: string;
  text: string;
  linkNodeKey?: string; // Store the key of the link node being edited
}

export const linkEditorStateAtom = atom<LinkEditorState>({
  isOpen: false,
  url: "",
  text: "",
  linkNodeKey: undefined,
});

// For toolbar state
export interface FormattingState {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isLink: boolean;
  isCode: boolean;
  listType: "bullet" | "number" | "check" | null;
  storedSelection: ReturnType<typeof $getSelection> | null;
  hasSelection: boolean;
}

export const formattingStateAtom = atom<FormattingState>({
  canUndo: false,
  canRedo: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isLink: false,
  isCode: false,
  listType: null,
  storedSelection: null,
  hasSelection: false,
});
