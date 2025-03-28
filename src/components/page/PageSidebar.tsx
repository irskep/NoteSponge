import { OutboundLinks } from "@/components/page/OutboundLinks";
import { RelatedPages } from "@/components/page/RelatedPages";
import { TagPanel } from "@/components/tags/TagPanel";
import type { PageData } from "@/types";
import { Flex } from "@radix-ui/themes";
import "@/components/page/PageSidebar.css";
import { useSidebarSectionState } from "@/hooks/useSidebarSectionState";
import type { CSSProperties } from "react";

interface PageProps {
  page: PageData;
  pageContent: string;
  style?: CSSProperties;
}

export default function PageSidebar({ page, pageContent, style }: PageProps) {
  // Initialize the sidebar section state persistence
  useSidebarSectionState();

  return (
    <Flex direction="column" className="PageSidebar" style={style}>
      <RelatedPages pageId={page.id} />
      <OutboundLinks pageId={page.id} />
      <TagPanel pageId={page.id} content={pageContent} />
    </Flex>
  );
}
