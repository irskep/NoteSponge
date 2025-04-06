import AppTheme from "@/components/AppTheme";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import PageWindowContents from "@/featuregroups/windows/page/PageWindowContents";
import { useEditorMenu } from "@/featuregroups/windows/page/menu";
import { useCleanupUnusedImagesOnMountAndUnmount } from "@/state/hooks/db/useCleanupUnusedImagesOnMountAndUnmount";
import useLoadActivePage from "@/state/hooks/db/useLoadActivePage";
import useLoadPagesAsNeeded from "@/state/hooks/db/useLoadPagesAsNeeded";
import usePageViewed from "@/state/hooks/db/usePageViewed";
import useDeriveLinksFromEditorState from "@/state/hooks/editor/useDeriveLinksFromEditorState";
import useKeepWindowTitleUpdated from "@/state/hooks/editor/useKeepWindowTitleUpdated";
import { useUpdatePageFromEditorState } from "@/state/hooks/editor/useUpdatePageFromEditorState";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
import { Provider, getDefaultStore } from "jotai";
import "./PageWindow.css";

export default function PageWindow() {
  useLoadActivePage();
  useEditorMenu();
  usePageViewed();
  useUpdateWindowFocus();
  useLoadPagesAsNeeded();
  useKeepWindowTitleUpdated();
  useCleanupUnusedImagesOnMountAndUnmount();
  useDeriveLinksFromEditorState();
  useUpdatePageFromEditorState();

  return (
    <Provider store={getDefaultStore()}>
      <AppTheme>
        <main className="PageWindow">
          <ToastProvider>
            <PageWindowContents />
            <SearchModal />
          </ToastProvider>
        </main>
      </AppTheme>
    </Provider>
  );
}
