import { PageContextMenu } from "@/components/page/PageContextMenu";
import { TagToken } from "@/components/tags/TagToken";
import { getRecentPages } from "@/services/db/actions/pages";
import { getPageTags } from "@/services/db/actions/tags";
import { openPageWindow } from "@/services/window";
import type { PageData } from "@/types";
import { formatDateTime } from "@/utils/dates";
import { useWindowFocus } from "@/utils/listenToWindowFocus";
import { FileTextIcon } from "@radix-ui/react-icons";
import { Box, Card, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import { useCallback, useEffect, useState } from "react";

interface PageWithTags extends PageData {
  tags?: string[];
}

export default function RecentPagesList() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pages, setPages] = useState<PageWithTags[]>([]);

  const loadPagesWithTags = useCallback(async () => {
    const recentPages = await getRecentPages();
    const pagesWithTags = await Promise.all(
      recentPages.map(async (page) => ({
        ...page,
        tags: await getPageTags(page.id),
      })),
    );
    setPages(pagesWithTags);
    setHasLoaded(true);
  }, []);

  useWindowFocus(() => {
    loadPagesWithTags();
  }, [loadPagesWithTags]);

  useEffect(() => {
    loadPagesWithTags();
  }, [loadPagesWithTags]);

  if (!hasLoaded) {
    return null;
  }

  if (pages.length === 0) {
    return (
      <Flex direction="column" gap="4" align="center" justify="center" py="6">
        <Text size="2" color="gray">
          No recently viewed pages
        </Text>
      </Flex>
    );
  }

  return (
    <Box p="4">
      <Heading size="4" mb="4">
        Recent Pages
      </Heading>
      <ScrollArea>
        <Flex direction="column" gap="2">
          {pages.map((page) => (
            <PageContextMenu key={page.id} pageId={page.id} onDelete={loadPagesWithTags}>
              <Card onClick={() => openPageWindow(page.id)} style={{ cursor: "pointer" }}>
                <Flex gap="3" align="start">
                  <Box style={{ color: "var(--gray-8)" }}>
                    <FileTextIcon width={24} height={24} />
                  </Box>
                  <Flex direction="column" gap="1" flexGrow="1">
                    <Text weight="medium" size="3">
                      {page.title || `Untitled Page ${page.id}`}
                    </Text>
                    <Flex gap="3">
                      <Text size="1" color="gray">
                        {page.lastViewedAt ? formatDateTime(page.lastViewedAt) : "Never viewed"}
                      </Text>
                      <Text size="1" color="gray">
                        •
                      </Text>
                      <Text size="1" color="gray">
                        {page.viewCount || 0} views
                      </Text>
                    </Flex>
                    {page.tags && page.tags.length > 0 && (
                      <Flex gap="2" mt="1" wrap="wrap">
                        {page.tags.map((tag) => (
                          <TagToken key={tag} tag={tag} showRemoveButton={false} supportsKeyboard={false} />
                        ))}
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              </Card>
            </PageContextMenu>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
