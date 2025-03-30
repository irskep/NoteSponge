import Page from "@/components/page/Page";
import SearchModal from "@/components/search/SearchModal";
import { ToastProvider } from "@/components/shared/Toast/Toast";
import { useEditorMenu } from "@/menu";
import { useCleanupUnusedImagesOnMountAndUnmount } from "@/state/hooks/db/useCleanupUnusedImagesOnMountAndUnmount";
import useLoadActivePage from "@/state/hooks/db/useLoadActivePage";
import useLoadPagesAsNeeded from "@/state/hooks/db/useLoadPagesAsNeeded";
import usePageViewed from "@/state/hooks/db/usePageViewed";
import useDeriveLinksFromEditorState from "@/state/hooks/editor/useDeriveLinksFromEditorState";
import useKeepWindowTitleUpdated from "@/state/hooks/editor/useKeepWindowTitleUpdated";
import { useUpdatePageFromEditorState } from "@/state/hooks/editor/useUpdatePageFromEditorState";
import useUpdateWindowFocus from "@/state/hooks/useUpdateWindowFocus";
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
    <main className="PageWindow">
      <ToastProvider>
        <Page />
        <SearchModal />
      </ToastProvider>
    </main>
  );
}
