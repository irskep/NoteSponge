import { FC, useEffect, useState } from "react";
import "../../shared/Modal.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { LexicalEditor } from "lexical";
import { $getSelection, $isRangeSelection } from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { Button, Flex, Theme } from "@radix-ui/themes";

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
          } else {
            setExistingUrl("");
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
                if (url) {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                    url,
                    target: "_blank",
                    rel: "noreferrer noopener",
                  });
                  onOpenChange(false);
                }
              }}
            >
              <Flex direction="column" gap="4">
                <Form.Field name="url" className="form-field">
                  <Form.Label>URL</Form.Label>
                  <Form.Control asChild>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com"
                      defaultValue={existingUrl}
                      required
                      autoFocus
                    />
                  </Form.Control>
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
