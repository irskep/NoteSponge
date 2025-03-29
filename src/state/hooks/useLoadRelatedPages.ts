import { getRelatedPages } from "@/services/db/actions/related";
import { activePageTagsWrittenToDatabaseAtom, pageIdAtom, relatedPagesAtom } from "@/state/pageState";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

export default function useLoadRelatedPages() {
  const pageId = useAtomValue(pageIdAtom);
  const setRelatedPages = useSetAtom(relatedPagesAtom);
  const activePageTagsWrittenToDatabase = useAtomValue(activePageTagsWrittenToDatabaseAtom);

  useEffect(() => {
    activePageTagsWrittenToDatabase; // just to declare a dependency
    getRelatedPages(pageId).then((relatedPages) => {
      setRelatedPages(relatedPages.map((p) => ({ id: p.id, sharedTags: p.sharedTags })));
    });
  }, [pageId, setRelatedPages, activePageTagsWrittenToDatabase]);
}
