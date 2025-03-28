import Page from "@/components/page/Page";
import { openPageWindow } from "@/services/window";
import { currentPageIdAtom, modalStateAtom } from "@/state/atoms";
import { getDefaultStore, useAtom } from "jotai";
import "./PageWindow.css";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useLoadPage, usePageViewed } from "@/hooks/pageDBHooks";
import { useEditorMenu } from "@/menu";
import { useCopyLinkToPageListener } from "@/menu/listeners/copyLinkToPageListener";
import { insertPageLinkAtCursor, useInsertPageLinkListener } from "@/menu/listeners/insertPageLinkListener";

export default function PageWindow() {
  const [pageID] = useAtom(currentPageIdAtom, { store: getDefaultStore() });
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadPage();
  useEditorMenu();
  usePageViewed(pageID);
  useCopyLinkToPageListener();
  useInsertPageLinkListener();

  return (
    <main className="PageWindow">
      <ToastProvider>
        {pageID !== null && <Page id={pageID} key={pageID} />}
        <SearchModal
          isOpen={modalState.isSearchOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isSearchOpen: false }))}
          onSelectPage={(id) => {
            openPageWindow(id);
            setModalState((prev) => ({ ...prev, isSearchOpen: false }));
          }}
          mode={modalState.searchMode}
          onInsertLink={(pageId) => {
            insertPageLinkAtCursor(pageId);
            setModalState((prev) => ({ ...prev, isSearchOpen: false }));
          }}
        />
      </ToastProvider>
    </main>
  );
}
