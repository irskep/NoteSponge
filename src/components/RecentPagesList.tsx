import { useEffect, useState } from "react";
import { PageData } from "../types";
import { getRecentPages } from "../services/db/actions";
import { openPageInNewWindow } from "../utils/windowManagement";
import { Button, Flex, Heading, ScrollArea, Text } from "@radix-ui/themes";

export default function RecentPagesList() {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    getRecentPages().then(setPages);
  }, []);

  if (pages.length === 0) {
    return (
      <Flex direction="column" gap="4" align="center" justify="center" py="6">
        <Text size="2" color="gray">No recently viewed pages</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4" p="4">
      <Heading size="4" mb="2">Recent Pages</Heading>
      <ScrollArea>
        <Flex direction="column" gap="2">
          {pages.map((page) => (
            <Button
              key={page.id}
              variant="soft"
              onClick={() => openPageInNewWindow(page.id)}
            >
              <Text>{page.title || `Untitled Page ${page.id}`}</Text>
            </Button>
          ))}
        </Flex>
      </ScrollArea>
    </Flex>
  );
}
