import { showToast } from "@/hooks/useToast";
import { currentPageIdAtom } from "@/state/atoms";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { getDefaultStore, useAtomValue } from "jotai";

export async function copyLinkToPage() {
  const currentPageId = useAtomValue(currentPageIdAtom, {
    store: getDefaultStore(),
  });
  if (!currentPageId) return;

  const linkText = `[[${currentPageId}]]`;
  await writeText(linkText);
  showToast("Success", "Link copied to clipboard", { type: "background" });
}
