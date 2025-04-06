import AppTheme from "@/components/AppTheme";
import { ToastProvider } from "@/components/Toast/Toast";
import SearchModal from "@/featuregroups/search/SearchModal";
import PageWindowContents from "@/featuregroups/windows/page/PageWindowContents";
import { useEditorMenu } from "@/featuregroups/windows/page/menu";
import useDeriveLinksFromEditorState from "@/featuregroups/windows/page/useDeriveLinksFromEditorState";
import { useUpdatePageFromEditorState } from "@/featuregroups/windows/page/useUpdatePageFromEditorState";
import { useCleanupUnusedImagesOnMountAndUnmount } from "@/flowHooks/useCleanupUnusedImagesOnMountAndUnmount";
import useKeepWindowTitleUpdated from "@/flowHooks/useKeepWindowTitleUpdated";
import performBoot from "@/flows/performBoot";
import useLoadPagesAsNeeded from "@/jankysync/hooks/useLoadPagesAsNeeded";
import usePageViewed from "@/jankysync/hooks/usePageViewed";
import useUpdateWindowFocus from "@/jankysync/hooks/useUpdateWindowFocus";
import { Provider, getDefaultStore } from "jotai";
import { useEffect } from "react";
import "./PageWindow.css";

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
