import { FC, useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { $getNodeByKey, $getSelection, LexicalEditor } from "lexical";
import { BaseSelection, $createTextNode } from "lexical";
import { $toggleLink, $createLinkNode, $isLinkNode } from "@lexical/link";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import "@/styles/index.css";
import { ExternalLinkForm } from "@/components/editor/ExternalLinkForm";

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
        <Form.Field name="text">
          <Flex direction="column" gap="2">
            <Form.Label>
              <Text as="label" size="2" weight="medium">
                Link Text
              </Text>
            </Form.Label>
            <TextField.Root
              name="text"
              placeholder="Link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              autoFocus
              size="2"
            />
          </Flex>
        </Form.Field>
      )
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content size="2" maxWidth="450px">
        <Dialog.Title>{initialUrl ? "Edit Link" : "Insert Link"}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {isNewLink ? "Add a link to your note." : "Update the link."}
        </Dialog.Description>

        <Form.Root onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2" mt="2">
              {maybeRenderLinkText()}
              <ExternalLinkForm
                url={url}
                setUrl={setUrl}
                autoFocus={!isNewLink}
                initialUrl={initialUrl}
                required={true}
                showVisitButton={!!initialUrl}
              />
            </Flex>

            <Flex justify="between" gap="3" mt="4">
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
                <Dialog.Close>
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
      </Dialog.Content>
    </Dialog.Root>
  );
};
