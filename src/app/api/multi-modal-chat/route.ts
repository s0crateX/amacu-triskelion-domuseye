import { streamText, UIMessage, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      system:
        'If the message contains "Analyze Output" → Reformat this real-estate PDF into a clean, professional structure. Keep all original information intact, but fix layout, headings, spacing, and alignment. Do not change any legal or financial details. If data is missing, mark it as [MISSING DATA].' +
        'If the message contains "Matching" → Compare the text content in the PDF with the information in the provided images (e.g., IDs, documents). Normalize names and text formats (e.g., ignore differences in word order, capitalization, or extra spaces). Ensure that key details such as names, addresses, and ID numbers match correctly. Highlight mismatches with [MISMATCH] and missing data with [MISSING DATA]. Only show the final result without explanations. Do not alter the original content.',
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
