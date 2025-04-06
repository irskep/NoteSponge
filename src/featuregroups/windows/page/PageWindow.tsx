import AppTheme from "@/components/AppTheme";
import { ToastProvider } from "@/components/Toast/Toast";
import SearchModal from "@/featuregroups/search/SearchModal";
import PageWindowContents from "@/featuregroups/windows/page/PageWindowContents";
import { useEditorMenu } from "@/featuregroups/windows/page/menu";
import useDeriveLinksFromEditorState from "@/state/hooks/editor/useDeriveLinksFromEditorState";
import useKeepWindowTitleUpdated from "@/state/hooks/editor/useKeepWindowTitleUpdated";
import { useUpdatePageFromEditorState } from "@/state/hooks/editor/useUpdatePageFromEditorState";
import useLoadPagesAsNeeded from "@/state/hooks/jankysync/useLoadPagesAsNeeded";
import usePageViewed from "@/state/hooks/jankysync/usePageViewed";
import { useCleanupUnusedImagesOnMountAndUnmount } from "@/state/hooks/useCleanupUnusedImagesOnMountAndUnmount";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
import { Provider, getDefaultStore } from "jotai";
import "./PageWindow.css";
import performBoot from "@/flows/performBoot";
import { useEffect } from "react";

export default function PageWindow() {
  useEffect(() => {
    performBoot();
  }, []);

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
