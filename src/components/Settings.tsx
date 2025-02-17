import { useState, useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";
import * as Form from "@radix-ui/react-form";
import { Theme, Button, Box, Text, TextField } from "@radix-ui/themes";

export function Settings() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Load the API key when component mounts
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const store = await Store.load("settings.json");
    const key = await store.get("anthropic_api_key");
    if (key) {
      setApiKey(key as string);
    }
  };

  const handleSave = async () => {
    const store = await Store.load("settings.json");
    await store.set("anthropic_api_key", apiKey);
    await store.save();
  };

  return (
    <Theme>
      <Box p="4">
        <Form.Root
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Form.Field name="apiKey">
            <Form.Label>
              <Text size="2" mb="2" weight="medium">
                Anthropic API Key
              </Text>
            </Form.Label>
            <Form.Control asChild>
              <TextField.Root
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Anthropic API key"
                size="3"
              />
            </Form.Control>
          </Form.Field>

          <Box mt="4">
            <Form.Submit asChild>
              <Button size="3" variant="solid">
                Save Settings
              </Button>
            </Form.Submit>
          </Box>
        </Form.Root>
      </Box>
    </Theme>
  );
}
