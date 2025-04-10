import { OutboundLinks } from "@/featuregroups/sidebar/OutboundLinks";
import { RelatedPages } from "@/featuregroups/sidebar/RelatedPages";
import { useSidebarSectionState } from "@/featuregroups/sidebar/useSidebarSectionState";
import { TagPanel } from "@/featuregroups/tags/TagPanel";
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
