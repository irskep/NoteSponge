import { FC } from "react";
import * as Form from "@radix-ui/react-form";
import { Button, Flex, Text } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import "../../styles/index.css";

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
  required = false,
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
            <Form.Control asChild>
              <input
                name="url"
                type="text"
                className="StyledInput"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required={required}
                autoFocus={autoFocus}
              />
            </Form.Control>

            {showVisitButton && initialUrl && (
              <Button
                type="button"
                variant="soft"
                color="gray"
                onClick={handleVisit}
              >
                Visit Link
              </Button>
            )}
          </Flex>
        </Flex>
      </Form.Field>
    </Flex>
  );
};
