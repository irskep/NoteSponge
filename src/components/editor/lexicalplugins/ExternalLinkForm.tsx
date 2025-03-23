import { FC } from "react";
import * as Form from "@radix-ui/react-form";
import { Button, Flex, Text } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-shell";
import "./ExternalLinkForm.css";

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
    <div className="ExternalLinkForm">
      <Form.Field name="url" className="form-field custom-form-field">
        <Flex direction="column" gap="2">
          <Form.Label>
            <Text as="label" size="2" weight="medium">
              URL
            </Text>
          </Form.Label>
          <Flex gap="2" align="center">
            <Form.Control asChild>
              <input
                name="url"
                type="text"
                className="form-input ExternalLinkForm__input"
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
                className="ExternalLinkForm__actions"
              >
                Visit Link
              </Button>
            )}
          </Flex>
        </Flex>
      </Form.Field>
    </div>
  );
};
