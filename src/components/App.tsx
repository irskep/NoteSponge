import { Theme } from "@radix-ui/themes";
import "./App.css";
import { useMenuEventListeners } from "../hooks/useAppState";
import RecentPagesList from "./RecentPagesList";
import { AppWindowMenuUpdater } from "./editor/state/AppWindowMenuUpdater";
import { useAtom } from "jotai";
import { modalStateAtom } from "../state/atoms";
import PageListModal from "./page/PageListModal";
import { openPageInNewWindow } from "../services/page";
import SearchModal from "./search/SearchModal";

function App() {
  const [modalState, setModalState] = useAtom(modalStateAtom);

  useMenuEventListeners();

  return (
    <main className="App">
      <AppWindowMenuUpdater />
      <Theme>
        <RecentPagesList />
        <PageListModal
          isOpen={modalState.isPageListOpen}
          onClose={() =>
            setModalState((prev) => ({ ...prev, isPageListOpen: false }))
          }
          onSelectPage={(id) => openPageInNewWindow(id)}
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
      </Theme>
    </main>
  );
}

export default App;
