import { PageData } from "@/types";
import { TagPanel } from "@/components/tags/TagPanel";
import { RelatedPages } from "@/components/page/RelatedPages";
import { OutboundLinks } from "@/components/page/OutboundLinks";
import { Flex } from "@radix-ui/themes";
import "@/components/page/PageSidebar.css";
import { CSSProperties } from "react";
import { useSidebarSectionState } from "@/hooks/useSidebarSectionState";

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
