import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { listen } from "@tauri-apps/api/event";
import { isDatabaseBootstrappedAtom, currentPageIdAtom, modalStateAtom } from "../state/atoms";
import { queryNextPageID, updatePageViewedAt } from "../services/db/actions";
import { getDB } from "../services/db";
import { openSettingsWindow, openPageInNewWindow } from "../utils/windowManagement";

export const useInitializeApp = () => {
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
    const unlisten = listen("tauri://menu", async (event) => {
      const { payload } = event;
      switch (payload) {
        case "menu_new_page":
          const nextId = await queryNextPageID();
          setPageID(nextId);
          break;
        case "menu_view_pages":
          setModalState(prev => ({ ...prev, isPageListOpen: true }));
          break;
        case "menu_search":
          setModalState(prev => ({ ...prev, isSearchOpen: true }));
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

export const usePageViewed = (pageID: number) => {
  useEffect(() => {
    updatePageViewedAt(pageID);
  }, [pageID]);
};

export const usePageActions = () => {
  const setPageID = useSetAtom(currentPageIdAtom);

  const handleNewPage = async () => {
    const nextId = await queryNextPageID();
    setPageID(nextId);
  };

  const handlePageSelect = async (id: number) => {
    await openPageInNewWindow(id);
  };

  return { handleNewPage, handlePageSelect };
};
