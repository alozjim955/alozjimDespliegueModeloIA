// api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { jsonSchema, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools, model } = await req.json(); // Ahora se recibe el modelo como parte del body

  // Si no se pasa un modelo, usamos "gpt-4o" por defecto
  const modelToUse = model || "gpt-4o"; 

  const result = streamText({
    model: openai(modelToUse), // Usamos el modelo recibido dinámicamente
    messages,
    system,
    tools: Object.fromEntries(
      Object.keys(tools).map((name) => [
        name,
        { ...tools[name], parameters: jsonSchema(tools[name].parameters) },
      ])
    ),
  });

  return result.toDataStreamResponse();
}