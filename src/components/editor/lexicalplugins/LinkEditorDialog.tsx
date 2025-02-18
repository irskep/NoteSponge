import { FC, useEffect, useState } from "react";
import "../../shared/Modal.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { LexicalEditor } from "lexical";
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical";
import { $createLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { Button, Flex, Theme, Text } from "@radix-ui/themes";

interface LinkEditorDialogProps {
  editor: LexicalEditor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl: string;
  initialText: string;
  storedSelection: ReturnType<typeof $getSelection> | null;
}

export const LinkEditorDialog: FC<LinkEditorDialogProps> = ({
  editor,
  isOpen,
  onOpenChange,
  initialUrl,
  initialText,
  storedSelection,
}) => {
  const [existingUrl, setExistingUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setExistingUrl(initialUrl);
      setLinkText(initialText);
    }
  }, [isOpen, initialUrl, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingUrl || !linkText) return;

    // Normalize URL: add https:// if no protocol is specified
    const normalizedUrl = /^https?:\/\//.test(existingUrl)
      ? existingUrl
      : `https://${existingUrl}`;

    editor.update(() => {
      if (!storedSelection || !$isRangeSelection(storedSelection)) return;

      const newLinkNode = $createLinkNode(normalizedUrl, {
        target: "_blank",
        rel: "noreferrer noopener",
      });
      newLinkNode.append($createTextNode(linkText));

      if (!storedSelection.isCollapsed()) {
        storedSelection.removeText();
      }
      storedSelection.insertNodes([newLinkNode]);
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Theme>
            <div className="dialog-header">
              <Dialog.Title className="dialog-title">
                {existingUrl ? "Edit Link" : "Insert Link"}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="dialog-close" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            <Form.Root onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
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
                        value={existingUrl}
                        onChange={(e) => setExistingUrl(e.target.value)}
                        required
                      />
                    </Form.Control>
                  </Flex>
                </Form.Field>
                <Flex justify="between" gap="3">
                  <Button
                    type="button"
                    variant="soft"
                    color="red"
                    onClick={() => {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                      onOpenChange(false);
                    }}
                  >
                    Remove Link
                  </Button>
                  <Flex gap="3">
                    <Dialog.Close asChild>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button type="submit" variant="solid">
                      {existingUrl ? "Update" : "Save"}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Form.Root>
          </Theme>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
