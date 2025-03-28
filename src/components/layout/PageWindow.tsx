import Page from "@/components/page/Page";
import { openPageWindow } from "@/services/window";
import { currentPageIdAtom, modalStateAtom } from "@/state/atoms";
import { getDefaultStore, useAtom } from "jotai";
import "./PageWindow.css";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useLoadPage, usePageViewed } from "@/hooks/pageDBHooks";
import { useEditorMenu } from "@/menu";
import { dispatchInsertInternalLinkCommand } from "../editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom, editorStateStore } from "../editor/state/editorStore";

export default function PageWindow() {
  const [pageID] = useAtom(currentPageIdAtom, { store: getDefaultStore() });
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadPage();
  useEditorMenu();
  usePageViewed(pageID);

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
            setModalState((prev) => ({ ...prev, isSearchOpen: false }));
            const editor = editorStateStore.get(editorAtom);
            if (editor) {
              dispatchInsertInternalLinkCommand(editor, pageId);
            }
          }}
        />
      </ToastProvider>
    </main>
  );
}
