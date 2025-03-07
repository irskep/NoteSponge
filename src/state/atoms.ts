import { atom } from "jotai";
import { PageData } from "../types";
import { $getSelection } from "lexical";

export const isPageEmptyAtom = atom<boolean>(true);
export const isDatabaseBootstrappedAtom = atom<boolean>(false);

export interface TagState {
  tags: string[];
  focusedTagIndex: number | null;
}

export const tagStateAtom = atom<TagState>({
  tags: [],
  focusedTagIndex: null,
});

// For tag input autocomplete suggestions
export const tagSuggestionsAtom = atom<Array<{ tag: string; count: number }>>(
  []
);
export const tagInputValueAtom = atom<string>("");
export const tagSelectedIndexAtom = atom<number | null>(null);
export const isTagPopoverOpenAtom = atom<boolean>(false);

// For AI-suggested tags
export const aiSuggestedTagsAtom = atom<string[] | null>(null);
export const isLoadingAiTagsAtom = atom<boolean>(false);

// Derived atom that filters out removed tags from AI suggestions
export const filteredAiSuggestionsAtom = atom((get) => {
  const aiSuggestions = get(aiSuggestedTagsAtom);
  const { tags } = get(tagStateAtom);
  return aiSuggestions?.filter((tag) => !tags.includes(tag)) ?? null;
});

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

export const currentPageIdAtom = atom<number | null>(null);

export interface ModalState {
  isPageListOpen: boolean;
  isSearchOpen: boolean;
}

export const modalStateAtom = atom<ModalState>({
  isPageListOpen: false,
  isSearchOpen: false,
});

export type PageMetadata = Pick<
  PageData,
  "viewCount" | "lastViewedAt" | "createdAt"
>;

export const pageMetadataAtom = atom<PageMetadata>({});

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
});
