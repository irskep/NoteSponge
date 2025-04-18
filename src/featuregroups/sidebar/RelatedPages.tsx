import PageReference from "@/featuregroups/sidebar/PageReference";
import { SidebarSection } from "@/featuregroups/sidebar/SidebarSection";
import useLoadRelatedPages from "@/jankysync/hooks/useLoadRelatedPages";
import { pageIdAtom, relatedPagesAtom } from "@/state/pageState";
import { Flex, Text } from "@radix-ui/themes";
import { useAtomValue } from "jotai";
import "./RelatedPages.css";

export function RelatedPages() {
  useLoadRelatedPages();
  const pageId = useAtomValue(pageIdAtom);
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
