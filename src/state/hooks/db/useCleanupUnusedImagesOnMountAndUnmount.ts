import { cleanupUnusedImages } from "@/flows/imagesReferencedByLexical";
import { pageIdAtom } from "@/state/pageState";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export function useCleanupUnusedImagesOnMountAndUnmount() {
  const pageId = useAtomValue(pageIdAtom);

  useEffect(() => {
    if (pageId !== null) {
      // Clean up unused images when the page is loaded
      cleanupUnusedImages(pageId).catch((err) => {
        console.error("Failed to clean up unused images:", err);
      });

      // Clean up unused images when the component is unmounted or page changes
      return () => {
        // TODO: This doesn't work because the web view is already gone by the time this would run.
        // Listen in the main window for close events instead and do it there.
        cleanupUnusedImages(pageId).catch((err) => {
          console.error("Failed to clean up unused images on unmount:", err);
        });
      };
    }
  }, [pageId]);
}
