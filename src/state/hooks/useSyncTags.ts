import { setPageTags } from "@/services/db/actions/tags";
import { activePageTagsAtom, activePageTagsWrittenToDatabaseAtom, isBootedAtom, pageIdAtom } from "@/state/pageState";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

export default function useSyncTags() {
  const isBooted = useAtomValue(isBootedAtom);
  const pageId = useAtomValue(pageIdAtom);
  const tags = useAtomValue(activePageTagsAtom);
  const [activePageTagsWrittenToDatabase, setActivePageTagsWrittenToDatabase] = useAtom(
    activePageTagsWrittenToDatabaseAtom,
  );

  useEffect(() => {
    if (!isBooted || !tags) return;

    if (JSON.stringify(activePageTagsWrittenToDatabase) === JSON.stringify(tags)) return;

    setPageTags(pageId, tags).then(() => {
      setActivePageTagsWrittenToDatabase(tags);
    });
  }, [pageId, tags, activePageTagsWrittenToDatabase, setActivePageTagsWrittenToDatabase, isBooted]);
}
