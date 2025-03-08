import { useAtom } from "jotai";
import { modalStateAtom } from "../state/atoms";
import "./App.css";
import PageListModal from "./page/PageListModal";
import SearchModal from "./search/SearchModal";
import { useMenuEventListeners } from "../hooks/useAppState";
import { Theme } from "@radix-ui/themes";
import RecentPagesList from "./RecentPagesList";
import { openPageInNewWindow } from "../services/page";
import { AppWindowMenuUpdater } from "./editor/state/AppWindowMenuUpdater";

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
