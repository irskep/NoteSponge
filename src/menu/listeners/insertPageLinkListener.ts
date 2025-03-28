import { INSERT_INTERNAL_LINK_COMMAND } from "@/components/editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom, editorStateStore } from "@/components/editor/state/editorStore";
import { modalStateAtom } from "@/state/atoms";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

export function useInsertPageLinkListener() {
  const [, setModalState] = useAtom(modalStateAtom);

  // Function to handle the link insertion after a page is selected
  const handleInsertPageLink = useCallback(() => {
    // Open the search modal in insertLink mode
    setModalState((prev) => ({
      ...prev,
      isSearchOpen: true,
      searchMode: "insertLink",
    }));
  }, [setModalState]);

  // Register the listener for the menu item
  useEffect(() => {
    const cleanup = listenToMenuItem("insert_page_link", handleInsertPageLink);
    return cleanup;
  }, [handleInsertPageLink]);
}

// This function should be called by the SearchModal when a page is selected in insertLink mode
export function insertPageLinkAtCursor(pageId: number) {
  const editor = editorStateStore.get(editorAtom);
  if (!editor) return false;

  // Dispatch the INSERT_INTERNAL_LINK_COMMAND to insert a link
  editor.dispatchCommand(INSERT_INTERNAL_LINK_COMMAND, { pageId });
  return true;
}
