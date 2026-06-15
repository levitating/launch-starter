import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

export async function complete({
  system,
  prompt,
  model = "claude-sonnet-4-6",
  maxTokens = 1024,
}: {
  system?: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const message = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}
