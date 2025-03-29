import Page from "@/components/page/Page";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useLoadPage, usePageViewed } from "@/hooks/pageDBHooks";
import { useEditorMenu } from "@/menu";
import { openPageWindow } from "@/services/window";
import { modalStateAtom } from "@/state/atoms";
import useLoadPagesAsNeeded from "@/state/hooks/useLoadPagesAsNeeded";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import { dispatchInsertInternalLinkCommand } from "../editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom } from "../editor/state/editorAtoms";
import "./PageWindow.css";
import { pageIdAtom } from "@/state/pageState";

export default function PageWindow() {
  const pageId = useAtomValue(pageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadPage();
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
