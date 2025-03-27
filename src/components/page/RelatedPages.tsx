import { useEffect } from "react";
import { openPageWindow } from "../../services/window";
import { Badge, Box, Flex, Heading, Text } from "@radix-ui/themes";
import "./RelatedPages.css";
import { useWindowFocus } from "../../utils/listenToWindowFocus";
import { getDefaultStore, useAtomValue } from "jotai";
import { relatedPagesAtom, relatedPagesErrorAtom } from "../../state/atoms";
import { fetchRelatedPages } from "../../services/page";

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

  if (error) {
    return null;
  }

  if (relatedPages.length === 0) {
    return (
      <Box className="RelatedPages">
        <Heading size="2" mb="2">
          Related Pages
        </Heading>
        <Text size="1" color="gray">
          No related pages found
        </Text>
      </Box>
    );
  }

  return (
    <Box className="RelatedPages">
      <Heading size="2" mb="2">
        Related Pages
      </Heading>
      <Flex direction="column" gap="2">
        {relatedPages.map((page) => (
          <a
            key={page.id}
            onClick={(e) => {
              e.preventDefault();
              openPageWindow(page.id);
            }}
            href="#"
            className="RelatedPages__link"
          >
            <Text
              color="blue"
              size="1"
              className="RelatedPages__linktitle"
              title={page.title}
            >
              {page.title}
            </Text>
            <Badge
              size="1"
              variant="soft"
              title={page.tags?.join(", ") || "No tags"}
            >
              {page.sharedTags}
            </Badge>
          </a>
        ))}
      </Flex>
    </Box>
  );
}
