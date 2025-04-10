import { ExternalLinkForm } from "@/featuregroups/texteditor/plugins/links/ExternalLinkForm";
import { linkEditorStateAtom, openModalsAtom } from "@/state/modalState";
import { $createLinkNode, $isLinkNode, $toggleLink } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as Form from "@radix-ui/react-form";
import { Button, Dialog, Flex, Text, TextField, VisuallyHidden } from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { $createTextNode, $getNodeByKey, $getSelection } from "lexical";
import { useCallback, useEffect, useState } from "react";

export const LinkEditorModal = () => {
  const [editor] = useLexicalComposerContext();
  const [openModals, setOpenModals] = useAtom(openModalsAtom);
  const linkEditorState = useAtomValue(linkEditorStateAtom);

  const initialUrl = linkEditorState.url;
  const initialText = linkEditorState.text;
  const linkNodeKey = linkEditorState.linkNodeKey;

  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);

  const isOpen = openModals.linkEditor;

  // If there's no initialUrl, we're creating a new link (no selection)
  const isNewLink = initialUrl === "";

  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpenModals((prev) => ({ ...prev, linkEditor: open }));
    },
    [setOpenModals],
  );

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
        <VisuallyHidden>
          <Dialog.Description size="2" mb="4">
            {isNewLink ? "Add a link to your note." : "Update the link."}
          </Dialog.Description>
        </VisuallyHidden>

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
