import { atom } from 'jotai';

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
export const tagSuggestionsAtom = atom<Array<{ tag: string; count: number }>>([]);
export const tagInputValueAtom = atom<string>("");
export const tagSelectedIndexAtom = atom<number | null>(null);
export const isTagPopoverOpenAtom = atom<boolean>(false);

// For AI-suggested tags
export const aiSuggestedTagsAtom = atom<string[] | null>(null);
export const isLoadingAiTagsAtom = atom<boolean>(false);

// Derived atom that filters out removed tags from AI suggestions
export const filteredAiSuggestionsAtom = atom(
  (get) => {
    const aiSuggestions = get(aiSuggestedTagsAtom);
    const { tags } = get(tagStateAtom);
    return aiSuggestions?.filter(tag => !tags.includes(tag)) ?? null;
  }
);

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

export interface PageMetadata {
  lastViewedAt?: string;
  createdAt?: string;
  viewCount?: number;
}

export const pageMetadataAtom = atom<PageMetadata>({});
