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
