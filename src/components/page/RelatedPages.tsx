import { useEffect, useState } from "react";
import {
  getRelatedPages,
  getPageTags,
  RelatedPageData,
} from "../../services/db/actions";
import { openPageWindow } from "../../services/window";
import { Badge, Box, Flex, Heading, Text } from "@radix-ui/themes";
import "./RelatedPages.css";

interface RelatedPagesProps {
  pageId: number;
}

interface ExtendedRelatedPageData extends RelatedPageData {
  tags?: string[];
}

export function RelatedPages({ pageId }: RelatedPagesProps) {
  const [relatedPages, setRelatedPages] = useState<ExtendedRelatedPageData[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedPages() {
      try {
        const pages = await getRelatedPages(pageId);
        const pagesWithTags = await Promise.all(
          pages.map(async (page) => ({
            ...page,
            tags: await getPageTags(page.id),
          }))
        );
        setRelatedPages(pagesWithTags);
        setError(null);
      } catch (err) {
        setError("Failed to load related pages");
        console.error(err);
      }
    }

    fetchRelatedPages();
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
            <Text color="blue" size="1">
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
