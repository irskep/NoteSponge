import { getAllTags, getPageTags } from "@/services/db/tags";
import { callLLM } from "@/services/foundation/llm";

export default async function fetchSuggestedTags(pageContent: string, pageId?: number): Promise<string[] | null> {
  if (pageContent.length < 64) {
    return null;
  }

  const [existingTags, pageTags] = await Promise.all([
    getAllTags(),
    pageId ? getPageTags(pageId) : Promise.resolve([]),
  ]);

  const tagsContext = [
    existingTags.length > 0
      ? `Here are all existing tags in the wiki: ${existingTags.join(", ")}`
      : "There are no existing tags in the wiki yet.",
    pageTags.length > 0
      ? `This page currently has these tags: ${pageTags.join(", ")}`
      : "This page currently has no tags.",
  ].join("\n");

  const result = await callLLM(async (client) => {
    if (!client) return null;

    const message = await client.messages.create({
      // model: "claude-3-haiku-20240307",
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${tagsContext}

Given this wiki page content, suggest appropriate tags.
Prioritize reusing existing tags when they fit well, but you may also suggest new tags if they would be more appropriate
Tags should be single words or hyphenated-phrases. Return only a JSON array of strings.

Be creative about what tags might apply. Consider all of the page content.
Suggest any tags that someone might want to use to find this document in the future.
Add at least one tag that could be interpreted as a joke about the content.

If it seems like the user is suggesting tags inline in the text and they aren't already tags, suggest them.

ONLY include JSON in the response. The ENTIRE response must parse as valid JSON. Do not add any notes, thoughts, or context.

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
      const suggestedTags = JSON.parse(textBlock.text) as string[];
      // Filter out tags that are already on the page
      return suggestedTags.filter((tag) => !pageTags.includes(tag));
    } catch (e) {
      console.error("Failed to parse LLM response as JSON array:", e);
      return [];
    }
  });

  return result;
}
