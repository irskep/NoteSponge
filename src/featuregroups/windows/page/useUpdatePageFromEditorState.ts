import { upsertPageContent } from "@/dbcalls/pageWrites";
import { deriveLexicalTitle } from "@/featuregroups/texteditor/editorStateHelpers";
import { debouncedEditorStateAtom } from "@/state/editorState";
import { activePageAtom, pageCacheAtoms, pageIdAtom } from "@/state/pageState";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";

export function useUpdatePageFromEditorState() {
  useEffect(() => {
    const store = getDefaultStore();

    return store.sub(debouncedEditorStateAtom, () => {
      const pageId = store.get(pageIdAtom);
      const page = store.get(activePageAtom);
      const editorState = store.get(debouncedEditorStateAtom);

      if (!editorState) return;

      const updatedPage = {
        ...page,
        title: editorState.read(() => deriveLexicalTitle()),
        lexicalState: editorState.toJSON(),
      };

      console.log("updatedPage", updatedPage);

      store.set(pageCacheAtoms.loadedPages, {
        ...store.get(pageCacheAtoms.loadedPages),
        [pageId]: updatedPage,
      });

      store.set(activePageAtom, updatedPage);

      upsertPageContent(updatedPage, editorState, updatedPage.title ?? "");
    });
  });
}
