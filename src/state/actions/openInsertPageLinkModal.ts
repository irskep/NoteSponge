import { modalStateAtom } from "@/state/atoms";
import { getDefaultStore } from "jotai";

export function openInsertPageLinkModal() {
  getDefaultStore().set(modalStateAtom, (prev) => ({
    ...prev,
    isSearchOpen: true,
    searchMode: "insertLink",
  }));
}
