import * as Form from "@radix-ui/react-form";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import type { FC } from "react";

interface ExternalLinkFormProps {
  url: string;
  setUrl: (url: string) => void;
  autoFocus?: boolean;
  initialUrl?: string;
  required?: boolean;
  showVisitButton?: boolean;
}

export const ExternalLinkForm: FC<ExternalLinkFormProps> = ({
  url,
  setUrl,
  autoFocus = false,
  initialUrl = "",
  showVisitButton = false,
}) => {
  const handleVisit = () => {
    if (!url) return;

    // Normalize URL for visit
    const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url}`;
    open(normalizedUrl);
  };

  return (
    <Flex width="100%">
      <Form.Field name="url" style={{ width: "100%" }}>
        <Flex direction="column" gap="2" width="100%">
          <Form.Label>
            <Text as="label" size="2" weight="medium">
              URL
            </Text>
          </Form.Label>
          <Flex gap="2" align="center" width="100%">
            <TextField.Root
              name="url"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus={autoFocus}
              size="2"
              style={{ width: "100%" }}
            />

            {showVisitButton && initialUrl && (
              <Button type="button" variant="soft" color="gray" onClick={handleVisit}>
                Visit Link
              </Button>
            )}
          </Flex>
        </Flex>
      </Form.Field>
    </Flex>
  );
};
