import { useEffect, useState } from "react";
import { PageData } from "../types";
import { getRecentPages, getPageTags } from "../services/db/actions";
import { openPageInNewWindow } from "../services/page";
import { Badge, Box, Card, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";
import { FileTextIcon } from "@radix-ui/react-icons";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PageContextMenu } from "./page/PageContextMenu";

interface PageWithTags extends PageData {
  tags?: string[];
}

export default function RecentPagesList() {
  const [pages, setPages] = useState<PageWithTags[]>([]);

  async function loadPagesWithTags() {
    const recentPages = await getRecentPages();
    const pagesWithTags = await Promise.all(
      recentPages.map(async (page) => ({
        ...page,
        tags: await getPageTags(page.id)
      }))
    );
    setPages(pagesWithTags);
  }

  useEffect(() => {
    loadPagesWithTags();

    const currentWindow = getCurrentWindow();
    const unlisten = currentWindow.listen("tauri://focus", () => {
      loadPagesWithTags();
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

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
            <PageContextMenu 
              key={page.id} 
              pageId={page.id}
              onDelete={loadPagesWithTags}
            >
              <Card
                onClick={() => openPageInNewWindow(page.id)}
                style={{ cursor: "pointer" }}
              >
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
                        {page.lastViewedAt
                          ? new Date(page.lastViewedAt).toLocaleString()
                          : "Never viewed"}
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
                          <Badge key={tag} size="1" variant="soft">
                            {tag}
                          </Badge>
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
