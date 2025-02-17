import { useState, useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";
import * as Form from "@radix-ui/react-form";
import { Theme, Box, Text, TextField, Flex } from "@radix-ui/themes";
import Anthropic from "@anthropic-ai/sdk";

interface ValidationState {
  isValid: boolean | null;
  error: string | null;
}

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [validation, setValidation] = useState<ValidationState>({
    isValid: null,
    error: null,
  });

  useEffect(() => {
    loadApiKey();
  }, []);

  useEffect(() => {
    if (apiKey) {
      validateApiKey(apiKey);
    } else {
      setValidation({ isValid: null, error: null });
    }
  }, [apiKey]);

  const validateApiKey = async (key: string) => {
    try {
      const client = new Anthropic({
        apiKey: key,
        dangerouslyAllowBrowser: true,
      });

      await client.models.list();
      setValidation({ isValid: true, error: null });
    } catch (err) {
      setValidation({
        isValid: false,
        error:
          err instanceof Error ? err.message : "Failed to validate API key",
      });
    }
  };

  const loadApiKey = async () => {
    const store = await Store.load("settings.json");
    const key = await store.get("anthropic_api_key");
    if (key) {
      setApiKey(key as string);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKey(newValue);
    const store = await Store.load("settings.json");
    await store.set("anthropic_api_key", newValue);
    await store.save();
  };

  return (
    <Theme>
      <Flex align="center" justify="between" style={{ minHeight: "100vh" }}>
        <Box p="4" style={{ width: "100%" }}>
          <Form.Root>
            <Form.Field name="apiKey" style={{ width: "100%" }}>
              <Form.Label>
                <Text size="2" mb="2" weight="medium">
                  Anthropic API Key
                </Text>
              </Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  type="password"
                  value={apiKey}
                  onChange={handleChange}
                  placeholder="Enter your Anthropic API key"
                  size="3"
                  style={{ width: "100%" }}
                />
              </Form.Control>
              <Text
                size="2"
                color={validation.isValid === null 
                  ? "gray" 
                  : validation.isValid 
                    ? "green" 
                    : "red"
                }
                mt="1"
                style={{
                  visibility:
                    validation.isValid === null && !apiKey
                      ? "hidden"
                      : "visible",
                  height: "1.5em", // Ensure consistent height
                }}
              >
                {validation.isValid === null
                  ? "Validating API key..."
                  : validation.isValid
                  ? "API key is valid"
                  : validation.error || "&nbsp;"}
              </Text>
            </Form.Field>
          </Form.Root>
        </Box>
      </Flex>
    </Theme>
  );
}
