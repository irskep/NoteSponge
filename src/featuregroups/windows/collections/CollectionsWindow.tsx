import AppTheme from "@/components/AppTheme";
import { ToastProvider } from "@/components/Toast/Toast";
import SearchModal from "@/featuregroups/search/SearchModal";
import RecentPagesList from "@/featuregroups/sidebar/RecentPagesList";
import { useAppMenu } from "@/featuregroups/windows/collections/menu";
import { useDisableEditorMenuOnFocus } from "@/flowHooks/windowFocusHooks";
import "@/styles/index.css";
import "@radix-ui/themes/styles.css";
import { Provider, getDefaultStore } from "jotai";
import "./CollectionsWindow.css";

function CollectionsWindow() {
  // Use the app menu hook
  useAppMenu();

  // Disable editor menus when app window is focused
  useDisableEditorMenuOnFocus();

  return (
    <Provider store={getDefaultStore()}>
      <AppTheme>
        <main className="CollectionsWindow">
          <ToastProvider>
            <RecentPagesList />
            <SearchModal />
          </ToastProvider>
        </main>
      </AppTheme>
    </Provider>
  );
}

export default CollectionsWindow;
