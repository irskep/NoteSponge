import { useState } from "react";
import { openPageWindow } from "../../services/window";
import { open } from "@tauri-apps/plugin-shell";
import { Box, Heading, Flex, IconButton, Link } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import "./OutboundLinks.css";
import { useAtomValue } from "jotai";
import { internalLinksAtom, externalLinksAtom } from "../../state/atoms";

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

interface OutboundLinksProps {
  onNavigateToNode?: (nodeKey: string) => void;
}

export function OutboundLinks({ onNavigateToNode }: OutboundLinksProps) {
  // Get links from atoms instead of processing serialized state
  const internalLinks = useAtomValue(internalLinksAtom);
  const externalLinks = useAtomValue(externalLinksAtom);

  // Manage expanded/collapsed state locally
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const handleLinkClick = (
    linkGroup: LinkGroup,
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    event.preventDefault();
    if (linkGroup.type === "internal") {
      openPageWindow(parseInt(linkGroup.id));
    } else {
      open(linkGroup.id);
    }
  };

  const handleInstanceClick = (
    nodeKey: string,
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    event.preventDefault();
    if (onNavigateToNode) {
      onNavigateToNode(nodeKey);
    }
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
    <Box className="OutboundLinks">
      <Heading size="2" mb="2">
        Outbound Links
      </Heading>
      <Flex direction="column" gap="1">
        {linkGroups.map((group) => (
          <Box className="OutboundLinks__group" key={group.id}>
            <Flex align="center" gap="1">
              <IconButton
                size="1"
                variant="ghost"
                onClick={() => toggleGroup(group.id)}
                className="OutboundLinks__toggle"
                aria-expanded={expandedGroups.has(group.id)}
                aria-label={
                  expandedGroups.has(group.id) ? "Collapse" : "Expand"
                }
              >
                {expandedGroups.has(group.id) ? (
                  <ChevronDownIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </IconButton>
              <Link
                className="OutboundLinks__groupTitle"
                color={group.type === "internal" ? "blue" : "indigo"}
                size="1"
                truncate={true}
                href="#"
                onClick={(e) => handleLinkClick(group, e)}
                aria-label={`Open ${
                  group.type === "internal" ? "page" : "link"
                }: ${group.title}`}
              >
                {group.title}
              </Link>
            </Flex>

            {expandedGroups.has(group.id) && group.instances.length > 0 && (
              <Flex
                pl="5"
                className="OutboundLinks__instances"
                direction="column"
                gap="0"
              >
                {group.instances.map((instance, idx) => (
                  <Link
                    key={idx}
                    size="1"
                    href="#"
                    truncate={true}
                    color="gray"
                    className="OutboundLinks__instance"
                    style={{ display: "block" }}
                    onClick={(e) => handleInstanceClick(instance.nodeKey, e)}
                    aria-label={`Navigate to ${
                      instance.text || "link"
                    } in document`}
                  >
                    {instance.text}
                  </Link>
                ))}
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
