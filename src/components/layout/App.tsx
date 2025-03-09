import { Theme } from "@radix-ui/themes";
import "./App.css";
import RecentPagesList from "../page/RecentPagesList";
import { useAtom } from "jotai";
import { modalStateAtom } from "../../state/atoms";
import PageListModal from "../page/PageListModal";
import { openPageWindow } from "../../services/window";
import SearchModal from "../search/SearchModal";
import { useAppMenu, useDisableEditorMenus } from "../../menu";

function App() {
  const [modalState, setModalState] = useAtom(modalStateAtom);

  // Use the app menu hook
  useAppMenu();

  // Disable editor menus when app window is focused
  useDisableEditorMenus();

  return (
    <main className="App">
      <Theme>
        <RecentPagesList />
        <PageListModal
          isOpen={modalState.isPageListOpen}
          onClose={() =>
            setModalState((prev) => ({ ...prev, isPageListOpen: false }))
          }
          onSelectPage={(id) => openPageWindow(id)}
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
      </Theme>
    </main>
  );
}

export default App;
