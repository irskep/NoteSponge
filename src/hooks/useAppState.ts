import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  isDatabaseBootstrappedAtom,
  currentPageIdAtom,
  modalStateAtom,
  pageMetadataAtom,
  tagStateAtom,
  tagInputValueAtom,
  isTagPopoverOpenAtom,
} from "../state/atoms";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  createNewPage,
  openPageInNewWindow,
  openSettingsWindow,
} from "../services/page";
import { getDB } from "../services/db";
import { updatePageViewedAt, fetchPage } from "../services/db/actions";
import { focusTagInput } from "../components/tags/TagBar";

export const useLoadPage = () => {
  const setIsDatabaseBootstrapped = useSetAtom(isDatabaseBootstrappedAtom);
  const setPageID = useSetAtom(currentPageIdAtom);

  useEffect(() => {
    const initDB = async () => {
      try {
        await getDB();
        const urlParams = new URLSearchParams(window.location.search);
        const pageIdParam = urlParams.get("page");
        if (pageIdParam) {
          const numericPageId = parseInt(pageIdParam, 10);
          if (!isNaN(numericPageId)) {
            setPageID(numericPageId);
          }
        } else {
          setPageID(null);
        }
        setIsDatabaseBootstrapped(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setIsDatabaseBootstrapped(false);
      }
    };
    initDB();
  }, [setIsDatabaseBootstrapped, setPageID]);
};

export const useMenuEventListeners = () => {
  const [, setModalState] = useAtom(modalStateAtom);
  const setPageID = useSetAtom(currentPageIdAtom);
  const [, setTagState] = useAtom(tagStateAtom);
  const [, setInputValue] = useAtom(tagInputValueAtom);
  const [, setIsOpen] = useAtom(isTagPopoverOpenAtom);

  useEffect(() => {
    const currentWindow = getCurrentWindow();
    const unlisten = currentWindow.listen("tauri://menu", async (event) => {
      const isFocused = await currentWindow.isFocused();
      // Ignore menu events if window not focused
      if (!isFocused) return;

      const { payload } = event;
      switch (payload) {
        case "menu_new_page":
          await createNewPage();
          break;
        case "menu_view_pages":
          setModalState((prev) => ({ ...prev, isPageListOpen: true }));
          break;
        case "menu_search":
          setModalState((prev) => ({ ...prev, isSearchOpen: true }));
          break;
        case "menu_settings":
          await openSettingsWindow();
          break;
        case "menu_recent_pages":
          await openRecentPagesWindow();
          break;
        case "menu_focus_tags":
          // Reset tag state and focus the input
          setTagState((prev) => ({ ...prev, focusedTagIndex: null }));
          setInputValue("");
          setIsOpen(true);
          // Use a timeout to ensure the DOM has updated
          setTimeout(() => {
            focusTagInput();
          }, 0);
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setModalState, setPageID, setTagState, setInputValue, setIsOpen]);
};

export const usePageViewed = (pageID: number | null) => {
  const setPageMetadata = useSetAtom(pageMetadataAtom);

  useEffect(() => {
    if (pageID === null) return;

    updatePageViewedAt(pageID).then(() => {
      // Fetch fresh metadata after updating
      fetchPage(pageID).then((page) => {
        if (page) {
          setPageMetadata({
            lastViewedAt: page.lastViewedAt,
            createdAt: page.createdAt,
            viewCount: page.viewCount,
          });
        }
      });
    });
  }, [pageID, setPageMetadata]);
};

export const usePageActions = () => {
  const handlePageSelect = async (id: number) => {
    await openPageInNewWindow(id);
  };

  return { handlePageSelect };
};

/**
 * Opens the Recent Pages window. If it already exists, brings it to focus.
 */
export async function openRecentPagesWindow() {
  const existingWindow = await WebviewWindow.getByLabel("main");
  if (existingWindow) {
    // See lib.rs on_window_event. We intercept window close events and
    // hide the main window instead of closing it. So this is the only
    // conditional branch we expect to hit.
    await existingWindow.show();
    await existingWindow.setFocus();
    return;
  }

  new WebviewWindow("main", {
    url: "index.html",
    title: "Recent Pages",
    width: 800,
    height: 600,
  });
}
