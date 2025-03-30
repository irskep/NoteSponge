import { getDefaultStore } from "jotai";
import { type LinkEditorState, linkEditorStateAtom, openModalsAtom } from "../modalState";

export default function openEditLinkModal(state: LinkEditorState) {
  const store = getDefaultStore();
  store.set(linkEditorStateAtom, state);
  store.set(openModalsAtom, (prev) => ({ ...prev, linkEditor: true }));
}
