import { useState, useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";
import * as Form from "@radix-ui/react-form";
import { Theme, Box, Text, TextField, Flex } from "@radix-ui/themes";

export function Settings() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    loadApiKey();
  }, []);

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
            </Form.Field>
          </Form.Root>
        </Box>
      </Flex>
    </Theme>
  );
}
