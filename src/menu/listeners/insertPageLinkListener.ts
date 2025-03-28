import { INSERT_INTERNAL_LINK_COMMAND } from "@/components/editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom, editorStateStore } from "@/components/editor/state/editorStore";
import { modalStateAtom } from "@/state/atoms";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

export function useInsertPageLinkListener() {
  const [, setModalState] = useAtom(modalStateAtom);

  const handleInsertPageLink = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isSearchOpen: true,
      searchMode: "insertLink",
    }));
  }, [setModalState]);

  useEffect(() => listenToMenuItem("insert_page_link", handleInsertPageLink), [handleInsertPageLink]);
}

export function insertPageLinkAtCursor(pageId: number) {
  editorStateStore.get(editorAtom)?.dispatchCommand(INSERT_INTERNAL_LINK_COMMAND, { pageId });
}
