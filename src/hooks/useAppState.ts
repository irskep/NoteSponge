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
    console.log("Listen");
    const currentWindow = getCurrentWindow();
    const unlisten = currentWindow.listen("tauri://menu", async (event) => {
      console.log(currentWindow, await currentWindow.isFocused(), event);
      // Ignore menu events if window not focused
      if (!(await currentWindow.isFocused())) return;

      const { payload } = event;
      console.log(payload);
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
      console.log("unlisten");
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
    await existingWindow.setFocus();
    return;
  }

  console.log("opening recent pages window");

  console.log(
    new WebviewWindow("main", {
      url: "index.html",
      title: "Recent Pages",
      width: 800,
      height: 600,
    }).show()
  );
}
