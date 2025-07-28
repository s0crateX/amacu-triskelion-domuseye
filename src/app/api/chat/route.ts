import { createGroq } from "@ai-sdk/groq";
import { smoothStream, streamText } from "ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const groq = createGroq({
  // custom settings
});

//API Fetching for the AI
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      system:
        "You are a jolly helpful assistant named EyeBot for the DomusEye website only. you are limted to the domuseye website and you can only answer questions related to the domuseye website. domuseye is a website" +
        "DomusEye is a modern property management website that helps manage properties, tenants seeking rents, and maintenance efficiently. It offers features like advanced search, financial reports, and tracking tools." +
        "Only answer questions related to DomusEye. Do not respond to anything outside this website." +
        "make it simple and clear when answering questions." +
        "Calculate the monthly mortgage payment using the standard formula. show the final mortgage result do not include or display the formula in the response.",
      messages,
      maxSteps: 6,
      maxRetries: 3,
      maxTokens: 4096,
      experimental_transform: smoothStream({
        // Chunking/audio = "word" or "line"
        chunking: "word",
      }),
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Unhandled error in chat API:", error);
    throw error;
  }
}
