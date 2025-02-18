import { FC, useEffect, useState } from "react";
import "../../shared/Modal.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { LexicalEditor } from "lexical";
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical";
import {
  $isLinkNode,
  $createLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { Button, Flex, Theme, Text } from "@radix-ui/themes";

interface LinkEditorDialogProps {
  editor: LexicalEditor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkEditorDialog: FC<LinkEditorDialogProps> = ({
  editor,
  isOpen,
  onOpenChange,
}) => {
  const [existingUrl, setExistingUrl] = useState<string>("");
  const [linkText, setLinkText] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.getNodes()[0];
          const parent = node.getParent();
          const linkNode = $isLinkNode(parent)
            ? parent
            : $isLinkNode(node)
            ? node
            : null;

          if (linkNode) {
            setExistingUrl(linkNode.getURL());
            setLinkText(linkNode.getTextContent());
          } else {
            setExistingUrl("");
            setLinkText(selection.getTextContent());
          }
        }
      });
    }
  }, [isOpen, editor]);

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
            <Form.Root
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const url = formData.get("url") as string;
                const text = formData.get("text") as string;

                if (url && text) {
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      // Delete the current selection content
                      selection.removeText();

                      // Create a new link node
                      const linkNode = $createLinkNode(url, {
                        target: "_blank",
                        rel: "noreferrer noopener",
                      });

                      // Add the text to the link node
                      linkNode.append($createTextNode(text));

                      // Insert the link node at the selection
                      selection.insertNodes([linkNode]);
                    }
                  });
                  onOpenChange(false);
                }
              }}
            >
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
                        type="text"
                        className="form-input"
                        placeholder="Link text"
                        defaultValue={linkText}
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
                        type="url"
                        className="form-input"
                        placeholder="https://example.com"
                        defaultValue={existingUrl}
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
