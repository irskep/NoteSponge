import { ReactNode, useState, useEffect } from "react";
import { Heading, Flex, IconButton, Box, Badge } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import "./SidebarSection.css";
import { useAtom, getDefaultStore } from "jotai";
import { sidebarSectionStateAtom } from "../../state/atoms";

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
  const [sectionState, setSectionState] = useAtom(sidebarSectionStateAtom, {
    store: getDefaultStore(),
  });
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Load state from atom on mount
  useEffect(() => {
    const savedState = sectionState[pageId]?.[title];

    if (savedState !== undefined) {
      setIsCollapsed(savedState);
    } else {
      setIsCollapsed(defaultCollapsed);
    }
  }, [pageId, title, defaultCollapsed, sectionState]);

  // Save state to atom when changed
  const toggleCollapsed = () => {
    const newState = !isCollapsed;

    setIsCollapsed(newState);

    setSectionState((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [title]: newState,
      },
    }));
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      className={`SidebarSection ${
        isCollapsed ? "SidebarSection--collapsed" : ""
      }`}
      style={{
        flexGrow: grow ? 1 : 0,
        flexShrink: shrink ? 1 : 0,
      }}
      data-section-title={title}
      data-collapsed={isCollapsed}
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
    </Flex>
  );
}
