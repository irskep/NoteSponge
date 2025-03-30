import { getDefaultStore } from "jotai";
import { modalStateAtom } from "../modalState";

export function openInsertPageLinkModal() {
  getDefaultStore().set(modalStateAtom, (prev) => ({
    ...prev,
    isSearchOpen: true,
    searchMode: "insertLink",
  }));
}
