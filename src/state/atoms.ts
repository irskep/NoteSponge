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

export const tagSuggestionsAtom = atom<Array<{ tag: string; count: number }>>([]);
export const tagInputValueAtom = atom<string>("");
export const tagSelectedIndexAtom = atom<number | null>(null);
export const isTagPopoverOpenAtom = atom<boolean>(false);
