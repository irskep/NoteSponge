import { ReactNode, useState } from "react";
import { Heading, Flex, IconButton, Text } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import "./SidebarSection.css";

interface SidebarSectionProps {
  children: ReactNode;
  title: string;
  grow?: boolean;
  shrink?: boolean;
  itemCount?: number;
  defaultCollapsed?: boolean;
}

export function SidebarSection({
  children,
  title,
  grow = false,
  shrink = false,
  itemCount = 0,
  defaultCollapsed = false,
}: SidebarSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
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
            size="1"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="SidebarSection__toggle"
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </IconButton>
          <Heading size="2">{title}</Heading>
        </Flex>
        {itemCount > 0 && (
          <Text size="1" className="SidebarSection__count">
            {itemCount}
          </Text>
        )}
      </Flex>
      <div
        className={`SidebarSection__content ${
          isCollapsed ? "SidebarSection__content--collapsed" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
