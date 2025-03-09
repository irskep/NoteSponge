import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  isDatabaseBootstrappedAtom,
  currentPageIdAtom,
  pageMetadataAtom,
} from "../state/atoms";
import { openPageWindow } from "../services/window";
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
