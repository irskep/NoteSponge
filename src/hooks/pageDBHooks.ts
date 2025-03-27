import { useEffect } from "react";
import { useSetAtom, getDefaultStore } from "jotai";
import {
  isDatabaseBootstrappedAtom,
  currentPageIdAtom,
  pageMetadataAtom,
} from "../state/atoms";
import { getDB } from "../services/db";
import { updatePageViewedAt, fetchPage } from "../services/db/actions";

/**
 * Hook to initialize the database and set the current page ID from URL parameters
 */
export const useLoadPage = () => {
  const setIsDatabaseBootstrapped = useSetAtom(isDatabaseBootstrappedAtom);
  const setPageID = useSetAtom(currentPageIdAtom, { store: getDefaultStore() });

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

/**
 * Hook to update page metadata when a page is viewed
 */
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
        } else {
          setPageMetadata({});
        }
      });
    });
  }, [pageID, setPageMetadata]);
};
