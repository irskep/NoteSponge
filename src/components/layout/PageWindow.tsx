import { useAtom } from "jotai";
import { currentPageIdAtom, modalStateAtom } from "../../state/atoms";
import Page from "../page/Page";
import { openPageWindow } from "../../services/window";
import "./PageWindow.css";
import { useLoadPage, usePageViewed } from "../../hooks/pageDBHooks";
import SearchModal from "../search/SearchModal";
import { useEditorMenu } from "../../menu";

export default function PageWindow() {
  const [pageID] = useAtom(currentPageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadPage();
  useEditorMenu();
  usePageViewed(pageID);

  return (
    <main className="PageWindow">
      {pageID !== null && <Page id={pageID} key={pageID} />}
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
