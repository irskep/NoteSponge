import { atom } from "jotai";

// Sidebar section collapse state
export interface SidebarSectionState {
  [pageId: number]: {
    [sectionTitle: string]: boolean; // true = collapsed, false = expanded
  };
}

export const sidebarSectionStateAtom = atom<SidebarSectionState>({});
