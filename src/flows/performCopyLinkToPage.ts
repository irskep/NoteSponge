import { showToast } from "@/components/Toast/useToast";
import { pageIdAtom } from "@/state/pageState";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useAtomValue } from "jotai";

export default async function performCopyLinkToPage() {
  const currentPageId = useAtomValue(pageIdAtom);
  if (!currentPageId) return;

  const linkText = `[[${currentPageId}]]`;
  await writeText(linkText);
  showToast("Success", "Link copied to clipboard", { type: "background" });
}
