import { useState, useEffect } from "react";
import { EditorState } from "lexical";
import { $dfs } from "@lexical/utils";
import { $isLinkNode } from "@lexical/link";
import {
  createEditorState,
  getLinkedInternalPageIds,
} from "../../utils/editor";
import { openPageWindow } from "../../services/window";
import { open } from "@tauri-apps/plugin-shell";
import { Box, Heading, Flex, Text } from "@radix-ui/themes";
import "./OutboundLinks.css";
import { getPageTitlesByIds } from "../../services/db/actions";

type BaseLink = {};

type InternalLink = BaseLink & {
  type: "internal";
  pageId: number;
  text: string;
};

type ExternalLink = BaseLink & {
  text: string;
  url: string;
  type: "external";
};

type Link = InternalLink | ExternalLink;

interface OutboundLinksProps {
  serializedEditorState: any;
}

export function getExternalLinks(editorState: EditorState): ExternalLink[] {
  return editorState.read(() =>
    $dfs()
      .map(({ node }) => node)
      .filter($isLinkNode)
      .map((node) => ({
        text: node.getTextContent(),
        url: node.getURL(),
        type: "external" as const,
      }))
  );
}

export function OutboundLinks({ serializedEditorState }: OutboundLinksProps) {
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    if (!serializedEditorState) return;

    const editorState = createEditorState(serializedEditorState);

    // Get internal links
    const internalPageIds = getLinkedInternalPageIds(editorState);
    const idArray = Array.from(internalPageIds);

    // Get external links
    const externalLinks = getExternalLinks(editorState);

    // Fetch page titles for internal links
    if (idArray.length > 0) {
      getPageTitlesByIds(idArray).then((titleMap) => {
        const internalLinks: InternalLink[] = idArray.map((id) => ({
          text: titleMap.get(id) || `Page ${id}`,
          type: "internal",
          pageId: id,
        }));

        // Combine both types of links
        setLinks([...internalLinks, ...externalLinks]);
      });
    } else {
      setLinks(externalLinks);
    }
  }, [serializedEditorState]);

  if (links.length === 0) return null;

  const handleLinkClick = (link: Link, event: React.MouseEvent) => {
    event.preventDefault();
    if (link.type === "internal") {
      openPageWindow(link.pageId);
    } else {
      open(link.url);
    }
  };

  return (
    <Box className="OutboundLinks">
      <Heading size="2" mb="2">
        Outbound Links
      </Heading>
      <Flex direction="column" gap="1">
        {links.map((link, index) => (
          <Text
            key={index}
            size="1"
            className={`OutboundLinks__link ${
              link.type === "internal"
                ? "OutboundLinks__link--internal"
                : "OutboundLinks__link--external"
            }`}
            onClick={(e) => handleLinkClick(link, e)}
          >
            {link.text}
          </Text>
        ))}
      </Flex>
    </Box>
  );
}
