import { ReactNode, useState, useEffect } from "react";
import { Heading, Flex, IconButton, Box, Badge } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import "./SidebarSection.css";
import {
  getSectionCollapsedState,
  setSectionCollapsedState,
} from "../../services/sidebar";

interface SidebarSectionProps {
  children: ReactNode;
  title: string;
  grow?: boolean;
  shrink?: boolean;
  itemCount?: number;
  defaultCollapsed?: boolean;
  pageId: number;
}

export function SidebarSection({
  children,
  title,
  grow = false,
  shrink = false,
  itemCount = 0,
  defaultCollapsed = false,
  pageId,
}: SidebarSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved collapse state on mount
  useEffect(() => {
    getSectionCollapsedState(pageId, title, defaultCollapsed)
      .then((savedCollapsedState) => {
        setIsCollapsed(savedCollapsedState);
        setIsInitialized(true);
      })
      .catch((err) => {
        console.error(
          `Failed to load collapsed state for section "${title}":`,
          err
        );
        setIsInitialized(true);
      });
  }, [pageId, title, defaultCollapsed]);

  // Save collapsed state when changed
  useEffect(() => {
    // Only save if we're initialized (not the initial state setting) and we have a pageId
    if (isInitialized && pageId !== undefined) {
      setSectionCollapsedState(pageId, title, isCollapsed).catch((err) => {
        console.error(
          `Failed to save collapsed state for section "${title}":`,
          err
        );
      });
    }
  }, [isCollapsed, pageId, title, isInitialized]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      className={`SidebarSection ${
        isCollapsed ? "SidebarSection--collapsed" : ""
      }`}
      style={{
        flexGrow: grow ? 1 : 0,
        flexShrink: shrink ? 1 : 0,
      }}
    >
      <Flex align="center" justify="between" mb="2">
        <Flex align="center" gap="1">
          <IconButton
            radius="small"
            size="1"
            variant="ghost"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
            color="gray"
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </IconButton>
          <Heading size="1">{title}</Heading>
        </Flex>
        {itemCount > 0 && (
          <Badge size="1" variant="soft" radius="full" color="gray">
            {itemCount}
          </Badge>
        )}
      </Flex>
      <Box
        className={`SidebarSection__content ${
          isCollapsed ? "SidebarSection__content--collapsed" : ""
        }`}
      >
        {children}
      </Box>
    </Box>
  );
}
