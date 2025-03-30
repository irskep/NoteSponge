import { atom } from "jotai";

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
export interface ModalState {
  isSearchOpen: boolean;
  searchMode: "navigate" | "insertLink";
}

export const modalStateAtom = atom<ModalState>({
  isSearchOpen: false,
  searchMode: "navigate",
});
