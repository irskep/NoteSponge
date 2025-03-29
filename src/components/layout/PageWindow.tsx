import Page from "@/components/page/Page";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useLoadPage, usePageViewed } from "@/hooks/pageDBHooks";
import { useEditorMenu } from "@/menu";
import { openPageWindow } from "@/services/window";
import { currentPageIdAtom, modalStateAtom } from "@/state/atoms";
import useLoadPagesAsNeeded from "@/state/hooks/useLoadPagesAsNeeded";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
import { getDefaultStore, useAtom } from "jotai";
import { dispatchInsertInternalLinkCommand } from "../editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom } from "../editor/state/editorAtoms";
import "./PageWindow.css";

export default function PageWindow() {
  const [pageID] = useAtom(currentPageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadPage();
  useEditorMenu();
  usePageViewed(pageID);
  useUpdateWindowFocus();
  useLoadPagesAsNeeded();

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
