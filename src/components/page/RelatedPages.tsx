import { SidebarSection } from "@/components/page/SidebarSection";
import useLoadRelatedPages from "@/state/hooks/useLoadRelatedPages";
import { relatedPagesAtom } from "@/state/pageState";
import { Flex, Text } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import PageReference from "./PageReference";
import "./RelatedPages.css";

interface RelatedPagesProps {
  pageId: number;
}

export function RelatedPages({ pageId }: RelatedPagesProps) {
  useLoadRelatedPages();
  const relatedPages = useAtomValue(relatedPagesAtom);
  const relatedPagesCount = relatedPages.length;

  return (
    <SidebarSection title="Related" shrink itemCount={relatedPagesCount} defaultCollapsed={true} pageId={pageId}>
      {relatedPages.length === 0 ? (
        <Text size="1" color="gray">
          No related pages found
        </Text>
      ) : (
        <Flex direction="column" gap="2" className="RelatedPages">
          {relatedPages.map((page) => (
            <PageReference key={page.id} pageId={page.id} />
          ))}
        </Flex>
      )}
    </SidebarSection>
  );
}
