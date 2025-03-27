import { useEffect } from "react";
import { openPageWindow } from "../../services/window";
import { Badge, Flex, Link, Text } from "@radix-ui/themes";
import "./RelatedPages.css";
import { useWindowFocus } from "../../utils/listenToWindowFocus";
import { getDefaultStore, useAtomValue } from "jotai";
import { relatedPagesAtom, relatedPagesErrorAtom } from "../../state/atoms";
import { fetchRelatedPages } from "../../services/page";
import { SidebarSection } from "./SidebarSection";

interface RelatedPagesProps {
  pageId: number;
}

export function RelatedPages({ pageId }: RelatedPagesProps) {
  const relatedPages = useAtomValue(relatedPagesAtom, {
    store: getDefaultStore(),
  });
  const error = useAtomValue(relatedPagesErrorAtom, {
    store: getDefaultStore(),
  });

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
      <Text size="1" color="gray" className="RelatedPages">
        No related pages found
      </Text>
    ) : (
      <div className="RelatedPages">
        <Flex direction="column" gap="2">
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
              className="RelatedPages__link"
            >
              <Flex align="center" justify="between" style={{ width: "100%" }}>
                <span className="RelatedPages__linktitle">{page.title}</span>
                <Badge
                  size="1"
                  variant="soft"
                  title={page.tags?.join(", ") || "No tags"}
                >
                  {page.sharedTags}
                </Badge>
              </Flex>
            </Link>
          ))}
        </Flex>
      </div>
    );

  return (
    <SidebarSection
      title="Related Pages"
      shrink
      itemCount={relatedPagesCount}
      defaultCollapsed={true}
    >
      {content}
    </SidebarSection>
  );
}
