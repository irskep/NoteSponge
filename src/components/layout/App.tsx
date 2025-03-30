import "./App.css";
import RecentPagesList from "@/components/page/RecentPagesList";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useAppMenu, useDisableEditorMenus } from "@/menu";
import { openPageWindow } from "@/services/window";
import { modalStateAtom } from "@/state/modalState";
import { useAtom } from "jotai";

function App() {
  const [modalState, setModalState] = useAtom(modalStateAtom);

  // Use the app menu hook
  useAppMenu();

  // Disable editor menus when app window is focused
  useDisableEditorMenus();

  return (
    <main className="App">
      <ToastProvider>
        <RecentPagesList />
        <SearchModal
          isOpen={modalState.isSearchOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isSearchOpen: false }))}
          onSelectPage={(id) => {
            openPageWindow(id);
            setModalState((prev) => ({ ...prev, isSearchOpen: false }));
          }}
          mode={modalState.searchMode}
        />
      </ToastProvider>
    </main>
  );
}

export default App;
