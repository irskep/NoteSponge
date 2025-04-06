import { openPageWindow } from "@/services/windowRouting";
import usePage from "@/state/hooks/db/usePage";
import { pageCacheAtoms, relatedPagesAtom } from "@/state/pageState";
import { Badge, Flex, Link, Skeleton, Text } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

export default function PageReference({ pageId }: { pageId: number }) {
  const page = usePage(pageId);
  const relatedPages = useAtomValue(relatedPagesAtom);
  const sharedTags = useMemo(
    () => relatedPages.filter((p) => p.id === pageId).map((p) => p.sharedTags),
    [relatedPages, pageId],
  );
  const tags = useAtomValue(pageCacheAtoms.loadedPagesTags)[pageId] ?? [];

  if (!page) return <Skeleton />;

  return (
    <Link
      size="1"
      key={page.id}
      title={page.title}
      color="blue"
      onClick={(e) => {
        e.preventDefault();
        openPageWindow(page.id);
      }}
      href="#"
    >
      <Flex align="center" justify="between" width="100%">
        <Text truncate size="1">
          {page.title}
        </Text>
        <Badge size="1" variant="soft" title={tags.join(", ") || "No tags"}>
          {sharedTags}
        </Badge>
      </Flex>
    </Link>
  );
}
