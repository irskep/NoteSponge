import { useAtom } from "jotai";
import { currentPageIdAtom, modalStateAtom } from "../state/atoms";
import "./App.css";
import Page from "./page/Page";
import PageListModal from "./page/PageListModal";
import SearchModal from "./search/SearchModal";
import { useInitializeApp, useMenuEventListeners, usePageViewed, usePageActions } from "../hooks/useAppState";
import { Theme } from "@radix-ui/themes";

function App() {
  const [pageID] = useAtom(currentPageIdAtom);
  const [modalState, setModalState] = useAtom(modalStateAtom);
  const { handlePageSelect } = usePageActions();

  useInitializeApp();
  useMenuEventListeners();
  usePageViewed(pageID);

  return (
    <main className="App">
      <Theme>
        <Page id={pageID} key={pageID} />
        <PageListModal
          isOpen={modalState.isPageListOpen}
          onClose={() => setModalState(prev => ({ ...prev, isPageListOpen: false }))}
          onSelectPage={handlePageSelect}
        />
        <SearchModal
          isOpen={modalState.isSearchOpen}
          onClose={() => setModalState(prev => ({ ...prev, isSearchOpen: false }))}
          onSelectPage={(id) => setModalState(prev => ({ ...prev, isSearchOpen: false }))}
        />
      </Theme>
    </main>
  );
}

export default App;
