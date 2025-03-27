import { PageData } from "../../types";
import { TagPanel } from "../tags/TagPanel";
import { RelatedPages } from "./RelatedPages";
import { OutboundLinks } from "./OutboundLinks";
import { Flex } from "@radix-ui/themes";
import "./PageSidebar.css";
import { CSSProperties } from "react";
import { useSidebarSectionState } from "../../hooks/useSidebarSectionState";

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
