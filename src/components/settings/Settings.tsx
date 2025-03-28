import AppTheme from "@/components/AppTheme";
import { useDisableEditorMenus, useSettingsMenu } from "@/menu";
import { resetLLMClient } from "@/services/llm/index";
import Anthropic from "@anthropic-ai/sdk";
import * as Form from "@radix-ui/react-form";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { open } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";

interface ValidationState {
  isValid: boolean | null;
  error: string | null;
}

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [syncPath, setSyncPath] = useState("");
  const [validation, setValidation] = useState<ValidationState>({
    isValid: null,
    error: null,
  });

  // Use the settings menu hook
  useSettingsMenu();

  // Disable editor menus when settings window is focused
  useDisableEditorMenus();

  useEffect(() => {
    loadSettings();
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
        error: err instanceof Error ? err.message : "Failed to validate API key",
      });
    }
  };

  const loadSettings = async () => {
    const store = await Store.load("settings.json");
    const key = await store.get("anthropic_api_key");
    const path = await store.get("sync_path");
    if (key) {
      setApiKey(key as string);
    }
    if (path) {
      setSyncPath(path as string);
    }
  };

  const handleChange = async (key: string, value: string) => {
    const store = await Store.load("settings.json");
    await store.set(key, value);
    await store.save();

    if (key === "anthropic_api_key") {
      setApiKey(value);
      resetLLMClient();
    } else if (key === "sync_path") {
      setSyncPath(value);
    }
  };

  const handleBrowse = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    open({
      multiple: false,
      directory: true,
    }).then((selectedPath) => {
      if (selectedPath) {
        handleChange("sync_path", selectedPath as string);
      }
    });
  };

  return (
    <AppTheme>
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
                  onChange={(e) => handleChange("anthropic_api_key", e.target.value)}
                  placeholder="Enter your Anthropic API key"
                  size="3"
                  style={{ width: "100%" }}
                />
              </Form.Control>
              <Text
                size="2"
                color={validation.isValid === null ? "gray" : validation.isValid ? "green" : "red"}
                mt="1"
                style={{
                  visibility: validation.isValid === null && !apiKey ? "hidden" : "visible",
                  height: "1.5em",
                }}
              >
                {validation.isValid === null
                  ? "Validating API key..."
                  : validation.isValid
                    ? "API key is valid"
                    : validation.error || "&nbsp;"}
              </Text>
            </Form.Field>

            <Form.Field name="syncPath" style={{ width: "100%", marginTop: "20px" }}>
              <Form.Label>
                <Text size="2" mb="2" weight="medium">
                  Sync Directory
                </Text>
              </Form.Label>
              <Flex gap="3">
                <Form.Control asChild>
                  <TextField.Root
                    value={syncPath}
                    onChange={(e) => handleChange("sync_path", e.target.value)}
                    placeholder="Select a directory for syncing notes"
                    size="3"
                    style={{ width: "100%" }}
                  />
                </Form.Control>
                <Button onClick={handleBrowse} size="3">
                  Browse
                </Button>
              </Flex>
            </Form.Field>
          </Form.Root>
        </Box>
      </Flex>
    </AppTheme>
  );
}
