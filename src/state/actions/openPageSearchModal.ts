import { getDefaultStore } from "jotai";
import { openModalsAtom, searchModalStateAtom } from "../modalState";

export function openPageSearchModal(mode: "navigate" | "insertLink" = "navigate") {
  const store = getDefaultStore();
  store.set(searchModalStateAtom, { mode });
  store.set(openModalsAtom, (prev) => ({ ...prev, search: true }));
}
