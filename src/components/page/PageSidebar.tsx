import { PageData } from "../../types";
import { TagPanel } from "../tags/TagPanel";
import { RelatedPages } from "./RelatedPages";
import { OutboundLinks } from "./OutboundLinks";
import { Flex } from "@radix-ui/themes";
import "./PageSidebar.css";
import { useAtomValue } from "jotai";
import { editorAtom, editorStateStore } from "../editor/state/editorStore";
import { navigateToNode } from "../../utils/editor";

interface PageProps {
  page: PageData;
  pageContent: string;
}

export default function PageSidebar({ page, pageContent }: PageProps) {
  const editor = useAtomValue(editorAtom, { store: editorStateStore });

  const handleNavigateToNode = (nodeKey: string) => {
    if (editor) {
      navigateToNode(editor, nodeKey);
    }
  };

  return (
    <Flex direction="column" className="PageSidebar">
      <RelatedPages pageId={page.id} />
      <OutboundLinks onNavigateToNode={handleNavigateToNode} />
      <TagPanel pageId={page.id} content={pageContent} />
    </Flex>
  );
}
