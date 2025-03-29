import { dispatchInsertInternalLinkCommand } from "@/components/editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom } from "@/components/editor/state/editorAtoms";
import Page from "@/components/page/Page";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useEditorMenu } from "@/menu";
import { openPageWindow } from "@/services/window";
import { modalStateAtom } from "@/state/atoms";
import useLoadActivePage from "@/state/hooks/db/useLoadActivePage";
import useLoadPagesAsNeeded from "@/state/hooks/db/useLoadPagesAsNeeded";
import usePageViewed from "@/state/hooks/db/usePageViewed";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
import { pageIdAtom } from "@/state/pageState";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import "./PageWindow.css";

export default function PageWindow() {
  const pageId = useAtomValue(pageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadActivePage();
  useEditorMenu();
  usePageViewed();
  useUpdateWindowFocus();
  useLoadPagesAsNeeded();

  return (
    <main className="PageWindow">
      <ToastProvider>
        {pageId !== null && <Page id={pageId} key={pageId} />}
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
