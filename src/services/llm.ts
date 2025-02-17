import { Store } from "@tauri-apps/plugin-store";
import Anthropic from "@anthropic-ai/sdk";

let storeInstance: Store | null = null;
let clientInstance: Anthropic | null = null;
let cachedApiKey: string | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load("settings.json");
  }
  return storeInstance;
}

async function getClient(): Promise<Anthropic> {
  const store = await getStore();
  const apiKey = await store.get("anthropic_api_key") as string;
  
  if (!apiKey) {
    throw new Error("Anthropic API key not found. Please set it in Settings.");
  }

  if (!clientInstance || apiKey !== cachedApiKey) {
    clientInstance = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    cachedApiKey = apiKey;
  }
  
  return clientInstance;
}

export async function canCallLLM(): Promise<boolean> {
  try {
    const client = await getClient();
    await client.models.list();
    return true;
  } catch (err) {
    return false;
  }
}

export async function callLLM<T>(
  fn: (anthropicAPI: Anthropic) => Promise<T>
): Promise<T> {
  const client = await getClient();
  return fn(client);
}

// Reset cached instances when API key changes
export function resetLLMClient(): void {
  storeInstance = null;
  clientInstance = null;
  cachedApiKey = null;
}
