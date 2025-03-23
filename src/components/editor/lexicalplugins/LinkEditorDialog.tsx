import { FC, useEffect, useState } from "react";
import "../../shared/Modal.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import * as Tabs from "@radix-ui/react-tabs";
import { Cross2Icon } from "@radix-ui/react-icons";
import { LexicalEditor } from "lexical";
import { BaseSelection, $createTextNode } from "lexical";
import { $toggleLink, $createLinkNode } from "@lexical/link";
import { Button, Flex, Text } from "@radix-ui/themes";
import AppTheme from "../../AppTheme";
import { fuzzyFindPagesByTitle } from "../../../services/db/actions";
import "./LinkEditorDialog.css";
import { PageSearch } from "./PageSearch";
import { ExternalLinkForm } from "./ExternalLinkForm";

interface LinkEditorDialogProps {
  editor: LexicalEditor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl: string;
  initialText: string;
  storedSelection: BaseSelection | null;
  linkNodeKey?: string;
}

export const LinkEditorDialog: FC<LinkEditorDialogProps> = ({
  editor,
  isOpen,
  onOpenChange,
  initialUrl,
  initialText,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);
  const [activeTab, setActiveTab] = useState<string>("external");
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [selectedPageTitle, setSelectedPageTitle] = useState<string>("");

  // If there's no initialUrl, we're creating a new link (no selection)
  const isNewLink = initialUrl === "";

  // If the initialUrl starts with #, it's an internal link
  const isInternalLink = initialUrl.startsWith("#");

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setLinkText(initialText);
      setActiveTab(isInternalLink ? "internal" : "external");

      if (isInternalLink) {
        const pageId = parseInt(initialUrl.substring(1), 10);
        if (!isNaN(pageId)) {
          setSelectedPageId(pageId);
          // We'll load the page title asynchronously
          fuzzyFindPagesByTitle("").then((pages) => {
            const page = pages.find((p) => p.id === pageId);
            if (page) {
              setSelectedPageTitle(page.title || "");
            }
          });
        }
      } else {
        setSelectedPageId(null);
        setSelectedPageTitle("");
      }
    }
  }, [isOpen, initialUrl, initialText, isInternalLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = "";

    if (activeTab === "external") {
      if (!url) return;

      // If creating a new link without selection, we need link text
      if (isNewLink && !linkText) return;

      // Normalize URL: add https:// if no protocol is specified
      // But leave it alone if it's only an anchor
      finalUrl = url;
      if (url.startsWith("#")) {
        finalUrl = url;
      } else if (!/^https?:\/\//.test(url)) {
        finalUrl = `https://${url}`;
      }
    } else {
      // Internal link
      if (selectedPageId === null) return;
      finalUrl = `#${selectedPageId}`;
    }

    editor.update(() => {
      if (isNewLink) {
        // Creating a new link with text
        const linkNode = $createLinkNode(finalUrl, {
          rel: "noreferrer noopener",
          target: "_blank",
        });
        linkNode.append($createTextNode(linkText));

        // Insert the new link at current selection
        const selection = editor
          .getEditorState()
          .read(() => editor._editorState._selection);
        if (selection) {
          selection.insertNodes([linkNode]);
        }
      } else {
        // Updating an existing link's URL only
        $toggleLink(finalUrl, {
          rel: "noreferrer noopener",
          target: "_blank",
        });
      }
    });

    onOpenChange(false);
  };

  const handleSelectPage = (pageId: number, pageTitle: string) => {
    setSelectedPageId(pageId);
    setSelectedPageTitle(pageTitle);
  };

  const maybeRenderLinkText = () => {
    return (
      isNewLink && (
        <Form.Field name="text" className="form-field custom-form-field">
          <Flex direction="column" gap="2">
            <Form.Label>
              <Text as="label" size="2" weight="medium">
                Link Text
              </Text>
            </Form.Label>
            <Form.Control asChild>
              <input
                name="text"
                type="text"
                className="form-input"
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                required
                autoFocus
              />
            </Form.Control>
          </Flex>
        </Form.Field>
      )
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <AppTheme>
            <div className="dialog-header">
              <Dialog.Title className="dialog-title">
                {initialUrl ? "Edit Link" : "Insert Link"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="dialog-close" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            <Form.Root onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Tabs.Root
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="LinkEditorDialog__tabs"
                >
                  <Tabs.List className="LinkEditorDialog__tabsList">
                    <Tabs.Trigger
                      value="external"
                      className="LinkEditorDialog__tabsTrigger"
                    >
                      External Link
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="internal"
                      className="LinkEditorDialog__tabsTrigger"
                    >
                      Page Link
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content
                    value="external"
                    className="LinkEditorDialog__tabsContent"
                  >
                    {maybeRenderLinkText()}
                    <ExternalLinkForm
                      url={url}
                      setUrl={setUrl}
                      autoFocus={!isNewLink}
                      initialUrl={initialUrl}
                      required={activeTab === "external"}
                      showVisitButton={!!initialUrl}
                    />
                  </Tabs.Content>

                  <Tabs.Content
                    value="internal"
                    className="LinkEditorDialog__tabsContent"
                  >
                    {maybeRenderLinkText()}
                    <PageSearch
                      autoFocus={!isNewLink && activeTab === "internal"}
                      selectedPageId={selectedPageId}
                      selectedPageTitle={selectedPageTitle}
                      onSelectPage={handleSelectPage}
                    />
                  </Tabs.Content>
                </Tabs.Root>

                <Flex justify="between" gap="3">
                  {!isNewLink && (
                    <Button
                      type="button"
                      variant="soft"
                      color="red"
                      onClick={() => {
                        editor.update(() => {
                          $toggleLink(null);
                        });
                        onOpenChange(false);
                      }}
                    >
                      Remove Link
                    </Button>
                  )}
                  {isNewLink && <div />} {/* Spacer when no remove button */}
                  <Flex gap="3">
                    <Dialog.Close asChild>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button
                      type="submit"
                      variant="solid"
                      disabled={activeTab === "internal" && !selectedPageId}
                    >
                      {initialUrl ? "Update" : "Create"}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Form.Root>
          </AppTheme>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
