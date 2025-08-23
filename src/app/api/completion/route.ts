import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { text, prompt } = await req.json();
  if (!prompt) return new Response("Prompt is required", { status: 400 });

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system:
      "You are a text editor. You will be given a prompt and a text to edit, which may be empty or incomplete. " +
      "Edit the text to match the prompt, and only respond with the full edited version of the text – do not include any other information, context, or explanation. If you add on to the text, respond with the full version, not just the new portion. Do not include the prompt or otherwise preface your response. " +
      "Do not enclose the response in quotes. You must strictly respond only if the topic is property-related (e.g., houses, buildings, land, or real estate)." +
      "If the prompt is about a person or any topic that cannot be categorized as a property, respond with:" +
      "The prompt is not related to property.",
    messages: [
      {
        role: "user",
        content: `Please edit this text and add more details to make it more engaging: "${
          text || ""
        }" according to this instruction: "${prompt}"`,
      },
    ],
  });

  return result.toTextStreamResponse();
}
