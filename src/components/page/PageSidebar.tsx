import { OutboundLinks } from "@/components/page/OutboundLinks";
import { RelatedPages } from "@/components/page/RelatedPages";
import { TagPanel } from "@/components/tags/TagPanel";
import { useSidebarSectionState } from "@/hooks/useSidebarSectionState";
import { Flex } from "@radix-ui/themes";
import type { CSSProperties } from "react";
import "./PageSidebar.css";

interface PageProps {
  style?: CSSProperties;
}

export default function PageSidebar({ style }: PageProps) {
  // Initialize the sidebar section state persistence
  useSidebarSectionState();

  return (
    <Flex direction="column" className="PageSidebar" style={style}>
      <RelatedPages />
      <OutboundLinks />
      <TagPanel />
    </Flex>
  );
}
