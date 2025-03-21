import { FC, useEffect, useState } from "react";
import "../../shared/Modal.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { LexicalEditor } from "lexical";
import { BaseSelection, $createTextNode } from "lexical";
import { $toggleLink, $createLinkNode } from "@lexical/link";
import { Button, Flex, Text } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import AppTheme from "../../AppTheme";

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

    // If creating a new link without selection, we need link text
    if (isNewLink && !linkText) return;

    // Normalize URL: add https:// if no protocol is specified
    // But leave it alone if it's only an anchor
    let normalizedUrl = url;
    if (url.startsWith("#")) {
      normalizedUrl = url;
    } else if (!/^https?:\/\//.test(url)) {
      normalizedUrl = `https://${url}`;
    }

    editor.update(() => {
      if (isNewLink) {
        // Creating a new link with text
        const linkNode = $createLinkNode(normalizedUrl, {
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
        $toggleLink(normalizedUrl, {
          rel: "noreferrer noopener",
          target: "_blank",
        });
      }
    });

    onOpenChange(false);
  };

  const handleVisit = () => {
    const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`;
    open(normalizedUrl);
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
                {isNewLink && (
                  <Form.Field name="text" className="form-field">
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
                )}
                <Form.Field name="url" className="form-field">
                  <Flex direction="column" gap="2">
                    <Form.Label>
                      <Text as="label" size="2" weight="medium">
                        URL
                      </Text>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        name="url"
                        type="text"
                        className="form-input"
                        placeholder="example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        autoFocus={!isNewLink}
                      />
                    </Form.Control>
                  </Flex>
                </Form.Field>
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
                    {initialUrl && (
                      <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        onClick={handleVisit}
                      >
                        Visit Link
                      </Button>
                    )}
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
