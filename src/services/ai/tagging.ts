import { callLLM } from "../llm";
import { getAllTags } from "../db/actions";

export async function suggestTags(
  pageContent: string
): Promise<string[] | null> {
  const existingTags = await getAllTags();
  const tagsContext =
    existingTags.length > 0
      ? `Here are all existing tags in the wiki: ${existingTags.join(", ")}`
      : "There are no existing tags in the wiki yet.";

  const result = await callLLM(async (client) => {
    if (!client) return null;

    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${tagsContext}

Given this wiki page content, suggest appropriate tags. If possible, reuse existing tags, but you may also suggest new tags if they would be more appropriate. Tags should be single words or hyphenated-phrases. Return only a JSON array of strings.

Content:
${pageContent}`,
        },
      ],
      temperature: 0.7,
    });

    try {
      const textBlock = message.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        console.error("No text block found in LLM response");
        return [];
      }
      return JSON.parse(textBlock.text) as string[];
    } catch (e) {
      console.error("Failed to parse LLM response as JSON array:", e);
      return [];
    }
  });

  return result;
}
