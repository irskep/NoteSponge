import { openPageWindow } from "@/services/window";
import { Badge, Flex, Link, Text } from "@radix-ui/themes";
import { useEffect } from "react";
import "./RelatedPages.css";
import { SidebarSection } from "@/components/page/SidebarSection";
import { fetchRelatedPages } from "@/services/page";
import { relatedPagesAtom, relatedPagesErrorAtom } from "@/state/atoms";
import { useWindowFocus } from "@/utils/listenToWindowFocus";
import { useAtomValue } from "jotai";

interface RelatedPagesProps {
  pageId: number;
}

export function RelatedPages({ pageId }: RelatedPagesProps) {
  const relatedPages = useAtomValue(relatedPagesAtom);
  const error = useAtomValue(relatedPagesErrorAtom);

  useEffect(() => {
    fetchRelatedPages(pageId);
  }, [pageId]);

  useWindowFocus(() => {
    fetchRelatedPages(pageId);
  }, [pageId]);

  const relatedPagesCount = relatedPages.length;

  if (error) {
    return null;
  }

  const content =
    relatedPages.length === 0 ? (
      <Text size="1" color="gray">
        No related pages found
      </Text>
    ) : (
      <Flex direction="column" gap="2" className="RelatedPages">
        {relatedPages.map((page) => (
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
              <Badge size="1" variant="soft" title={page.tags?.join(", ") || "No tags"}>
                {page.sharedTags}
              </Badge>
            </Flex>
          </Link>
        ))}
      </Flex>
    );

  return (
    <SidebarSection title="Related" shrink itemCount={relatedPagesCount} defaultCollapsed={true} pageId={pageId}>
      {content}
    </SidebarSection>
  );
}
