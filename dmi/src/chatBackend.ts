import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve("../../.env") })

const { text } = await generateText({
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },

  model: openai("o3-mini"),
  prompt: "Cuentame un chiste de 10 palabras."
})

console.log(text)