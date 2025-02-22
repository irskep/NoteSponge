import { useEffect, useState } from "react";
import { getRelatedPages, getPageTags, RelatedPageData } from "../../services/db/actions";
import { openPageInNewWindow } from "../../utils/windowManagement";
import { Badge, Box, Button, Flex, Heading, Popover, Text } from "@radix-ui/themes";
import { Link2Icon } from "@radix-ui/react-icons";
import "./RelatedPages.css";

interface RelatedPagesProps {
  pageId: number;
}

interface ExtendedRelatedPageData extends RelatedPageData {
  tags?: string[];
}

export function RelatedPages({ pageId }: RelatedPagesProps) {
  const [relatedPages, setRelatedPages] = useState<ExtendedRelatedPageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchRelatedPages() {
      try {
        const pages = await getRelatedPages(pageId);
        const pagesWithTags = await Promise.all(
          pages.map(async (page) => ({
            ...page,
            tags: await getPageTags(page.id)
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

  if (error || relatedPages.length === 0) {
    return null;
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Button variant="ghost" className="related-pages-button">
          <Link2Icon />
          <Text size="1" color="gray">
            {relatedPages.length}
          </Text>
        </Button>
      </Popover.Trigger>
      <Popover.Content onMouseLeave={() => setIsOpen(false)}>
        <Box className="related-pages-content">
          <Heading size="2" mb="2">Related Pages</Heading>
          <Flex direction="column" gap="2">
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
                <Badge 
                  size="1" 
                  variant="soft" 
                  title={page.tags?.join(", ") || "No tags"}
                >
                  {page.sharedTags} shared
                </Badge>
              </a>
            ))}
          </Flex>
        </Box>
      </Popover.Content>
    </Popover.Root>
  );
}
