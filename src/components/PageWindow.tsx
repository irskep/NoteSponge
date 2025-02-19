import { useAtom } from "jotai";
import { currentPageIdAtom, modalStateAtom } from "../state/atoms";
import {
  useLoadPage,
  useMenuEventListeners,
  usePageViewed,
} from "../hooks/useAppState";
import Page from "./page/Page";
import PageListModal from "./page/PageListModal";
import SearchModal from "./search/SearchModal";
import { openPageInNewWindow } from "../utils/windowManagement";
import "./PageWindow.css";

export default function PageWindow() {
  const [pageID] = useAtom(currentPageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useLoadPage();
  useMenuEventListeners();
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
          openPageInNewWindow(id);
          setModalState((prev) => ({ ...prev, isSearchOpen: false }));
        }}
      />
      <SearchModal
        isOpen={modalState.isSearchOpen}
        onClose={() =>
          setModalState((prev) => ({ ...prev, isSearchOpen: false }))
        }
        onSelectPage={(id) => {
          openPageInNewWindow(id);
          setModalState((prev) => ({ ...prev, isSearchOpen: false }));
        }}
      />
    </main>
  );
}
