import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve("../../.env") })


export const duracionMax = 10; 
export async function POST(req: Request) {
  const { messages } = await req.json();

  const { response } = streamText({
    model: openai("o3-mini"),
    system: "Eres un asistente de colegio",
    messages,

    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },

  });

  return response;
}