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
import { createNewPage } from "../services/page";
import {
  openPageWindow,
  openSettingsWindow,
  openRecentPagesWindow,
} from "../services/window";
import { getDB } from "../services/db";
import { updatePageViewedAt, fetchPage } from "../services/db/actions";
import { focusTagInput } from "../components/tags/TagBar";
import { listenToMenuItem } from "../utils/menuEvents";

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
    const cleanupFunctions: Array<() => void> = [];

    // Register handlers for each menu item
    listenToMenuItem("menu_new_page", async () => {
      await createNewPage();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_view_pages", () => {
      setModalState((prev) => ({ ...prev, isPageListOpen: true }));
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_search", () => {
      setModalState((prev) => ({ ...prev, isSearchOpen: true }));
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_settings", async () => {
      await openSettingsWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_recent_pages", async () => {
      await openRecentPagesWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_focus_tags", () => {
      // Reset tag state and focus the input
      setTagState((prev) => ({ ...prev, focusedTagIndex: null }));
      setInputValue("");
      setIsOpen(true);
      // Use a timeout to ensure the DOM has updated
      setTimeout(() => {
        focusTagInput();
      }, 0);
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Clean up all listeners when component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
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
    await openPageWindow(id);
  };

  return { handlePageSelect };
};
