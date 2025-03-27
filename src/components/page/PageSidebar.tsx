import { PageData } from "../../types";
import { TagPanel } from "../tags/TagPanel";
import { RelatedPages } from "./RelatedPages";
import { OutboundLinks } from "./OutboundLinks";
import { Flex, Separator } from "@radix-ui/themes";
import "./PageSidebar.css";
import { useAtomValue } from "jotai";
import { editorAtom, editorStateStore } from "../editor/state/editorStore";
import {
  $getNodeByKey,
  $setSelection,
  $createRangeSelection,
  $createNodeSelection,
} from "lexical";
import { $isInternalLinkNode } from "../editor/lexicalplugins/internallink/InternalLinkNode";

interface PageProps {
  page: PageData;
  pageContent: string;
}

export default function PageSidebar({ page, pageContent }: PageProps) {
  const editor = useAtomValue(editorAtom, { store: editorStateStore });

  const navigateToNode = (nodeKey: string) => {
    if (!editor) return;

    let needsScroll = false;

    editor.focus(() => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey);
          if (!node) {
            console.error("Node not found:", nodeKey);
            return;
          }
          if ($isInternalLinkNode(node)) {
            needsScroll = true;
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(nodeKey);
            $setSelection(nodeSelection);
          } else {
            const rangeSelection = $createRangeSelection();
            rangeSelection.anchor.set(nodeKey, 0, "element");
            rangeSelection.focus.set(nodeKey, 0, "element");
            $setSelection(rangeSelection);
          }
        },
        {
          discrete: true,
          onUpdate: () => {
            // The above selection code looks correct but doesn't
            // work, so just brute force it
            if (needsScroll) {
              editor.getElementByKey(nodeKey)?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          },
        }
      );
    });
  };

  return (
    <Flex direction="column" className="PageSidebar">
      <div className="PageSidebar__section" style={{ flexShrink: 0 }}>
        <RelatedPages pageId={page.id} />
      </div>
      <Separator size="4" my="1" />
      <div className="PageSidebar__section" style={{ flexShrink: 0 }}>
        <OutboundLinks onNavigateToNode={navigateToNode} />
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
