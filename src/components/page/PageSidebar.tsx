import { PageData } from "../../types";
import { TagPanel } from "../tags/TagPanel";
import { RelatedPages } from "./RelatedPages";
import { OutboundLinks } from "./OutboundLinks";
import { Flex, Separator } from "@radix-ui/themes";
import "./PageSidebar.css";

interface PageProps {
  page: PageData;
  pageContent: string;
}

export default function Page({ page, pageContent }: PageProps) {
  return (
    <Flex direction="column" className="PageSidebar">
      <div className="PageSidebar__section" style={{ flexShrink: 0 }}>
        <RelatedPages pageId={page.id} />
      </div>
      <Separator size="4" my="1" />
      <div className="PageSidebar__section" style={{ flexShrink: 0 }}>
        <OutboundLinks serializedEditorState={page.lexicalState} />
      </div>
      <Separator size="4" my="1" />
      <div
        className="PageSidebar__section"
        style={{ flexGrow: 1, flexShrink: 1 }}
      >
        <TagPanel pageId={page.id} content={pageContent} />
      </div>
    </Flex>
  );
}
