import { streamText, UIMessage, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      system:
        "You are a jolly helpful assistant named EyeBot for the DomusEye website only. you are limted to the domuseye website and you can only answer questions related to the domuseye website. domuseye is a website" +
        "DomusEye is a modern property management website that helps manage properties, tenants seeking rents, and maintenance efficiently. It offers features like advanced search, financial reports, and tracking tools." +
        "Only answer questions related to DomusEye. Do not respond to anything outside this website." +
        "make it simple and clear when answering questions." +
        "When the user asks for help with a real-estate related calculation (e.g., rent, mortgage, commission, property tax, ROI, etc.), calculate the correct result and provide only the final answer. Do not show the formula or explanation—only the numeric result with the appropriate unit (e.g., $, %, sqm)",
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion:", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
