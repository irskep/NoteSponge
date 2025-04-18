import { SidebarSection } from "@/featuregroups/sidebar/SidebarSection";
import navigateToNode from "@/featuregroups/sidebar/utils/navigateToNode";
import { navigateToPage } from "@/services/windowRouting";
import { editorAtom, externalLinksAtom, internalLinksAtom } from "@/state/editorState";
import { pageIdAtom } from "@/state/pageState";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Link, Text } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import { useAtomValue } from "jotai";
import { useState } from "react";
import "./OutboundLinks.css";

interface LinkInstance {
  text: string;
  nodeKey: string;
}

interface LinkGroup {
  id: string; // pageId or url
  title: string;
  type: "internal" | "external";
  instances: LinkInstance[];
  expanded: boolean;
}

export function OutboundLinks() {
  const pageId = useAtomValue(pageIdAtom);
  const editor = useAtomValue(editorAtom);
  // Get links from atoms instead of processing serialized state
  const internalLinks = useAtomValue(internalLinksAtom);
  const externalLinks = useAtomValue(externalLinksAtom);

  // Manage expanded/collapsed state locally
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const outboundLinksCount = internalLinks.length + externalLinks.length;

  // Convert atom data to UI-ready link groups
  const linkGroups: LinkGroup[] = [
    // Internal links
    ...internalLinks.map((link) => ({
      id: link.pageId.toString(),
      title: link.title,
      type: "internal" as const,
      instances: link.instances,
      expanded: expandedGroups.has(link.pageId.toString()),
    })),

    // External links
    ...externalLinks.map((link) => ({
      id: link.url,
      title: link.url,
      type: "external" as const,
      instances: link.instances,
      expanded: expandedGroups.has(link.url),
    })),
  ];

  const handleLinkClick = (linkGroup: LinkGroup, event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    if (linkGroup.type === "internal") {
      navigateToPage(Number.parseInt(linkGroup.id));
    } else {
      open(linkGroup.id);
    }
  };

  const handleInstanceClick = (nodeKey: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    if (!editor) return;
    navigateToNode(editor, nodeKey);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  return (
    <SidebarSection title="Links" shrink itemCount={outboundLinksCount} defaultCollapsed={true} pageId={pageId}>
      <Flex direction="column" gap="1">
        {linkGroups.map((group) => (
          <Box key={group.id} my="1" mb="2">
            <Flex align="center" gap="1">
              <IconButton
                size="1"
                variant="ghost"
                radius="small"
                onClick={() => toggleGroup(group.id)}
                color="gray"
                aria-expanded={expandedGroups.has(group.id)}
                aria-label={expandedGroups.has(group.id) ? "Collapse" : "Expand"}
              >
                {expandedGroups.has(group.id) ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </IconButton>
              <Link
                color={group.type === "internal" ? "blue" : "indigo"}
                size="1"
                style={{ width: "100%" }}
                href="#"
                truncate={true}
                onClick={(e) => handleLinkClick(group, e)}
                aria-label={`Open ${group.type === "internal" ? "page" : "link"}: ${group.title}`}
              >
                <Text truncate>{group.title}</Text>
              </Link>
            </Flex>

            {expandedGroups.has(group.id) && group.instances.length > 0 && (
              <Flex
                pl="5"
                direction="column"
                gap="0"
                mt="1"
                style={{
                  borderLeft: "var(--border-width) solid var(--border-default)",
                }}
              >
                {group.instances.map((instance) => (
                  <Link
                    key={instance.nodeKey}
                    size="1"
                    href="#"
                    truncate={true}
                    color="gray"
                    style={{ padding: "var(--space-1)" }}
                    onClick={(e) => handleInstanceClick(instance.nodeKey, e)}
                    aria-label={`Navigate to ${instance.text || "link"} in document`}
                  >
                    <Text truncate>{instance.text}</Text>
                  </Link>
                ))}
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
    </SidebarSection>
  );
}
