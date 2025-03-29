import { getTauriSettingsStore } from "@/state/tauriSettingsStore";
import Anthropic from "@anthropic-ai/sdk";

let clientInstance: Anthropic | null = null;

async function getClient(): Promise<Anthropic | null> {
  if (clientInstance) {
    return clientInstance;
  }

  const store = await getTauriSettingsStore();
  const apiKey = (await store.get("anthropic_api_key")) as string;

  if (!apiKey) {
    clientInstance = null;
    // No API key
    return null;
  }

  clientInstance = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  return clientInstance;
}

export async function canCallLLM(): Promise<boolean> {
  try {
    const client = await getClient();
    if (!client) return false;
    await client.models.list();
    return true;
  } catch (err) {
    return false;
  }
}

export async function callLLM<T>(fn: (anthropicAPI: Anthropic) => Promise<T>): Promise<T | null> {
  const client = await getClient();
  if (!client) return null;
  return fn(client);
}

// Reset cached instances when API key changes
export function resetLLMClient(): void {
  clientInstance = null;
}
