import { getDB } from "@/services/db";
import { updatePageViewedAt } from "@/services/db/actions/pageWrites";
import { fetchPage } from "@/services/db/actions/pages";
import { currentPageIdAtom, isDatabaseBootstrappedAtom, pageMetadataAtom } from "@/state/atoms";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

/**
 * Hook to initialize the database and set the current page ID from URL parameters
 */
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
          const numericPageId = Number.parseInt(pageIdParam, 10);
          if (!Number.isNaN(numericPageId)) {
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
