import "@/components/layout/App.css";
import RecentPagesList from "@/components/page/RecentPagesList";
import { useAtom } from "jotai";
import { modalStateAtom } from "@/state/atoms";
import { openPageWindow } from "@/services/window";
import SearchModal from "@/components/search/SearchModal";
import { useAppMenu, useDisableEditorMenus } from "@/menu";
import AppTheme from "@/components/AppTheme";
import { ToastProvider } from "@/components/shared/Toast";

function App() {
  const [modalState, setModalState] = useAtom(modalStateAtom);

  // Use the app menu hook
  useAppMenu();

  // Disable editor menus when app window is focused
  useDisableEditorMenus();

  return (
    <main className="App">
      <AppTheme>
        <ToastProvider>
          <RecentPagesList />
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
        </ToastProvider>
      </AppTheme>
    </main>
  );
}

export default App;
