import { atom, createStore } from "jotai";
import { LexicalEditor } from "lexical";
import { $getSelection } from "lexical";

// Create a store instance for working with editor state outside of React components
// This store is used for both format menu and toolbar state
export const editorStateStore = createStore();

// Editor instance atom
export const editorAtom = atom<LexicalEditor | null>(null);

// For link editor state
export interface LinkEditorState {
  isOpen: boolean;
  url: string;
  text: string;
}

export const linkEditorStateAtom = atom<LinkEditorState>({
  isOpen: false,
  url: "",
  text: "",
});

// For toolbar state
export interface ToolbarState {
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

export const toolbarStateAtom = atom<ToolbarState>({
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
