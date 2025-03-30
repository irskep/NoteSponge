import "./App.css";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import RecentPagesList from "@/components/sidebar/RecentPagesList";
import { useAppMenu, useDisableEditorMenus } from "@/menu";

function App() {
  // Use the app menu hook
  useAppMenu();

  // Disable editor menus when app window is focused
  useDisableEditorMenus();

  return (
    <main className="App">
      <ToastProvider>
        <RecentPagesList />
        <SearchModal />
      </ToastProvider>
    </main>
  );
}

export default App;
