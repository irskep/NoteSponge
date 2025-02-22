import { useEffect, useState } from "react";
import { getRelatedPages, RelatedPageData } from "../../services/db/actions";
import { openPageInNewWindow } from "../../utils/windowManagement";
import { Badge, Box, Flex, Heading, Text } from "@radix-ui/themes";
import "./RelatedPages.css";

interface RelatedPagesProps {
  pageId: number;
}

export function RelatedPages({ pageId }: RelatedPagesProps) {
  const [relatedPages, setRelatedPages] = useState<RelatedPageData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedPages() {
      try {
        const pages = await getRelatedPages(pageId);
        setRelatedPages(pages);
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
    return null;
  }

  return (
    <Box className="related-pages">
      <Heading size="2" mb="4">
        Related Pages
      </Heading>
      <Flex gap="2" wrap="wrap">
        {relatedPages.map((page) => (
          <a
            key={page.id}
            onClick={(e) => {
              e.preventDefault();
              openPageInNewWindow(page.id);
            }}
            href="#"
            className="related-page-link"
          >
            <Text color="blue" size="1">
              {page.title}
            </Text>
            <Badge size="1" variant="soft">
              {page.sharedTags} shared
            </Badge>
          </a>
        ))}
      </Flex>
    </Box>
  );
}
