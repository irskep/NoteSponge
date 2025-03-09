import { useAtom, useAtomValue } from "jotai";
import { currentPageIdAtom, modalStateAtom } from "../../state/atoms";
import Page from "../page/Page";
import { openPageWindow } from "../../services/window";
import "./PageWindow.css";
import { useLoadPage, usePageViewed } from "../../hooks/useAppState";
import PageListModal from "../page/PageListModal";
import SearchModal from "../search/SearchModal";
import { editorAtom } from "../editor/LexicalTextEditor";
import { useEditorMenu } from "../../menu";

export default function PageWindow() {
  const [pageID] = useAtom(currentPageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);
  const editor = useAtomValue(editorAtom);

  useLoadPage();
  useEditorMenu(editor);
  usePageViewed(pageID);

  return (
    <main className="PageWindow">
      <Page id={pageID} key={pageID} />
      <PageListModal
        isOpen={modalState.isPageListOpen}
        onClose={() =>
          setModalState((prev) => ({ ...prev, isPageListOpen: false }))
        }
        onSelectPage={(id) => {
          openPageWindow(id);
          setModalState((prev) => ({ ...prev, isSearchOpen: false }));
        }}
      />
      <SearchModal
        isOpen={modalState.isSearchOpen}
        onClose={() =>
          setModalState((prev) => ({ ...prev, isSearchOpen: false }))
        }
        onSelectPage={(id) => {
          openPageWindow(id);
          setModalState((prev) => ({ ...prev, isSearchOpen: false }));
        }}
      />
    </main>
  );
}
