import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  isDatabaseBootstrappedAtom,
  currentPageIdAtom,
  modalStateAtom,
  pageMetadataAtom,
} from "../state/atoms";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createNewPage, openPageInNewWindow, openSettingsWindow } from "../services/page";
import { getDB } from "../services/db";
import { updatePageViewedAt, fetchPage } from "../services/db/actions";

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

  useEffect(() => {
    const currentWindow = getCurrentWindow();
    const unlisten = currentWindow.listen("tauri://menu", async (event) => {
      // Ignore menu events if window not focused
      if (!(await currentWindow.isFocused())) return;

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
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setModalState, setPageID]);
};

export const usePageViewed = (pageID: number | null) => {
  const setPageMetadata = useSetAtom(pageMetadataAtom);

  useEffect(() => {
    if (pageID === null) return;

    console.log("usePageViewed", pageID);
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
