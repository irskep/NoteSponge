import { getPageTags, setPageTags } from "@/services/db/actions/tags";
import {
  activePageTagsAtom,
  activePageTagsWrittenToDatabaseAtom,
  isBootedAtom,
  pageIdAtom,
  pageTagsAtom,
} from "@/state/pageState";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

export default function useSyncTags() {
  const isBooted = useAtomValue(isBootedAtom);
  const pageId = useAtomValue(pageIdAtom);
  const [pageTags, setPageTagsAtom] = useAtom(pageTagsAtom);
  const tags = useAtomValue(activePageTagsAtom);
  const [activePageTagsWrittenToDatabase, setActivePageTagsWrittenToDatabase] = useAtom(
    activePageTagsWrittenToDatabaseAtom,
  );

  // Load tags
  useEffect(() => {
    getPageTags(pageId).then((tags) => {
      setPageTagsAtom({ ...pageTags, [pageId]: tags });
    });
  }, [pageId, pageTags, setPageTagsAtom]);

  // Save tags to the database when they change
  useEffect(() => {
    if (!isBooted || !tags) return;

    if (JSON.stringify(activePageTagsWrittenToDatabase) === JSON.stringify(tags)) return;

    setPageTags(pageId, tags).then(() => {
      setActivePageTagsWrittenToDatabase(tags);
    });
  }, [pageId, tags, activePageTagsWrittenToDatabase, setActivePageTagsWrittenToDatabase, isBooted]);
}
