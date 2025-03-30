import { atom } from "jotai";

export type LinkEditorState = {
  url: string;
  text: string;
  linkNodeKey?: string; // Store the key of the link node being edited
};

export const linkEditorStateAtom = atom<LinkEditorState>({
  url: "",
  text: "",
  linkNodeKey: undefined,
});

export interface SearchModalState {
  mode: "navigate" | "insertLink";
}

export const searchModalStateAtom = atom<SearchModalState>({
  mode: "navigate",
});

// Unified version of the state above:

export type ModalType = "linkEditor" | "search";
export const openModalsAtom = atom<{ [key in ModalType]: boolean }>({
  linkEditor: false,
  search: false,
});
