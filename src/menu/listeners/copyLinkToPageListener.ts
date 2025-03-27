import { useEffect } from "react";
import { useAtomValue, getDefaultStore } from "jotai";
import { currentPageIdAtom } from "../../state/atoms";
import { listenToMenuItem } from "../../utils/listenToMenuItem";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useToast } from "../../hooks/useToast";

export function useCopyLinkToPageListener() {
  const currentPageId = useAtomValue(currentPageIdAtom, {
    store: getDefaultStore(),
  });
  const { showToast } = useToast();

  useEffect(() => {
    const handleCopyLinkToPage = async () => {
      if (currentPageId === null) {
        showToast("Error", "No page is currently open", { type: "background" });
        return;
      }

      const linkText = `[[${currentPageId}]]`;
      await writeText(linkText);
      showToast("Success", "Link copied to clipboard", { type: "background" });
    };

    const cleanup = listenToMenuItem("copy_link_to_page", handleCopyLinkToPage);

    return cleanup;
  }, [currentPageId, showToast]);
}
