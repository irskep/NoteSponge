import { dispatchInsertInternalLinkCommand } from "@/components/editor/lexicalplugins/internallink/InternalLinkPlugin";
import Page from "@/components/page/Page";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useEditorMenu } from "@/menu";
import { openPageWindow } from "@/services/window";
import { modalStateAtom } from "@/state/atoms";
import { editorAtom } from "@/state/editorState";
import { useCleanupUnusedImagesOnMountAndUnmount } from "@/state/hooks/db/useCleanupUnusedImagesOnMountAndUnmount";
import useLoadActivePage from "@/state/hooks/db/useLoadActivePage";
import useLoadPagesAsNeeded from "@/state/hooks/db/useLoadPagesAsNeeded";
import usePageViewed from "@/state/hooks/db/usePageViewed";
import useDeriveLinksFromEditorState from "@/state/hooks/editor/useDeriveLinksFromEditorState";
import useKeepWindowTitleUpdated from "@/state/hooks/editor/useKeepWindowTitleUpdated";
import { useUpdatePageFromEditorState } from "@/state/hooks/editor/useUpdatePageFromEditorState";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
import { getDefaultStore, useAtom } from "jotai";
import "./PageWindow.css";

export default function PageWindow() {
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadActivePage();
  useEditorMenu();
  usePageViewed();
  useUpdateWindowFocus();
  useLoadPagesAsNeeded();
  useKeepWindowTitleUpdated();
  useCleanupUnusedImagesOnMountAndUnmount();
  useDeriveLinksFromEditorState();
  useUpdatePageFromEditorState();

  return (
    <main className="PageWindow">
      <ToastProvider>
        <Page />
        <SearchModal
          isOpen={modalState.isSearchOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isSearchOpen: false }))}
          onSelectPage={(id) => {
            openPageWindow(id);
            setModalState((prev) => ({ ...prev, isSearchOpen: false }));
          }}
          mode={modalState.searchMode}
          onInsertLink={(pageId) => {
            setModalState((prev) => ({ ...prev, isSearchOpen: false }));
            const editor = getDefaultStore().get(editorAtom);
            if (editor) {
              dispatchInsertInternalLinkCommand(editor, pageId);
            }
          }}
        />
      </ToastProvider>
    </main>
  );
}
