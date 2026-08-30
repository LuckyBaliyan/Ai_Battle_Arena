//import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere"
import config from "../config/config.js";
import Groq from "groq-sdk";;

/*export const geminiModel = new ChatGoogle({
      model: "gemini-flash-latest",
      apiKey: config.GOOGLE_API_KEY,
})*/

export const mistralaiModel = new ChatMistralAI({
      model: "mistral-medium-latest",
      apiKey: config.MISTRAL_API_KEY,
})

export const cohereModel = new ChatCohere({
      model: "command-a-03-2025",
      apiKey: config.COHERE_API_KEY,
})




/**
 * JUDGE MODEL
 *
 * Groq is used directly here instead of wrapping it with
 * LangChain's createAgent/providerStrategy.
 *
 * This gives us direct access to Groq's native strict
 * JSON Schema structured output.
 */

export const groqClient = new Groq({
      apiKey: config.GROQ_API_KEY,
});


export const GroqJudgeModel = config.GROQ_AI_MODEL;
