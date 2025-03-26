import { FC, useEffect, useState } from "react";
import "../../shared/Modal.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { $getNodeByKey, $getSelection, LexicalEditor } from "lexical";
import { BaseSelection, $createTextNode } from "lexical";
import { $toggleLink, $createLinkNode, $isLinkNode } from "@lexical/link";
import { Button, Flex, Text } from "@radix-ui/themes";
import AppTheme from "../../AppTheme";
import "./LinkEditorDialog.css";
import "../../../styles/index.css";
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
  linkNodeKey,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);

  // If there's no initialUrl, we're creating a new link (no selection)
  const isNewLink = initialUrl === "";

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setLinkText(initialText);
    }
  }, [isOpen, initialUrl, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) return;

    let linkTextWithValue = linkText;
    if (!linkText) {
      linkTextWithValue = url;
    }

    // Normalize URL: add https:// if no protocol is specified
    let finalUrl = url;
    if (!/^https?:\/\//.test(url)) {
      finalUrl = `https://${url}`;
    }

    editor.update(() => {
      if (isNewLink) {
        // Creating a new link with text
        const linkNode = $createLinkNode(finalUrl, {
          rel: "noreferrer noopener",
          target: "_blank",
        });
        linkNode.append($createTextNode(linkTextWithValue));

        // Insert the new link at current selection
        const selection = $getSelection();
        if (selection) {
          selection.insertNodes([linkNode]);
        }
      } else {
        if (!linkNodeKey) {
          console.error("Link editor opened with no link node key");
          // Fallback behavior
          $toggleLink(finalUrl, {
            rel: "noreferrer noopener",
            target: "_blank",
          });
          return;
        }
        const linkNode = $getNodeByKey(linkNodeKey);
        // Updating an existing link's URL only
        if (linkNode && $isLinkNode(linkNode)) {
          linkNode.setURL(finalUrl);
        } else {
          console.error("Link node not found: ", linkNodeKey);
          // Fallback behavior
          $toggleLink(finalUrl, {
            rel: "noreferrer noopener",
            target: "_blank",
          });
        }
      }
    });

    onOpenChange(false);
  };

  const maybeRenderLinkText = () => {
    return (
      isNewLink && (
        <Form.Field name="text" className="ExternalLinkForm__field">
          <Flex direction="column" gap="2">
            <Form.Label>
              <Text as="label" size="2" weight="medium">
                Link Text
              </Text>
            </Form.Label>
            <Form.Control asChild className="ExternalLinkForm__inputControl">
              <input
                name="text"
                type="text"
                className="ExternalLinkForm__input StyledInput"
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
        <Dialog.Overlay className="Modal__overlay" />
        <Dialog.Content className="Modal__content">
          <AppTheme>
            <div className="Modal__header">
              <Dialog.Title className="Modal__title">
                {initialUrl ? "Edit Link" : "Insert Link"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="Modal__closeButton" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            <Form.Root onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <div className="LinkEditorDialog__content">
                  {maybeRenderLinkText()}
                  <ExternalLinkForm
                    url={url}
                    setUrl={setUrl}
                    autoFocus={!isNewLink}
                    initialUrl={initialUrl}
                    required={true}
                    showVisitButton={!!initialUrl}
                  />
                </div>

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
                    <Button type="submit" variant="solid">
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
