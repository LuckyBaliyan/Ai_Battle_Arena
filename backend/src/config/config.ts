import { config as dotenvConfig } from "dotenv";
dotenvConfig();

/**
 * GEMINI_API_KEY
 * MISTRAL_API_KEY
 * COHERE_API_KEY
*/

type CONFIG = {
      readonly GOOGLE_API_KEY: string;
      readonly MISTRAL_API_KEY: string;
      readonly COHERE_API_KEY: string;
      readonly GROQ_API_KEY: string;
      readonly DEEPSEEK_API_KEY: string;
      readonly OPEN_ROUTER_API_KEY: string;
      readonly GROQ_AI_MODEL: string;
      readonly TAVLY_API_KEY: string;
      readonly QWEN_MODEL: string;
      readonly GROQ_FIGHTER_MODEL: string;
      readonly GROQ_JUDGE_MODEL: string;
}

const config: CONFIG = {
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "",
      COHERE_API_KEY: process.env.COHERE_API_KEY || "",

      GROQ_API_KEY: process.env.GROQ_API_KEY || "",
      GROQ_AI_MODEL: 'openai/gpt-oss-20b',

      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",

      TAVLY_API_KEY: process.env.TAVLY_API_KEY || "",


      QWEN_MODEL:
            process.env.QWEN_MODEL || "qwen/qwen3-32b",

      GROQ_FIGHTER_MODEL: process.env.GROQ_FIGHTER_MODEL || "openai/gpt-oss-20b",
      GROQ_JUDGE_MODEL: process.env.GROQ_JUDGE_MODEL || "openai/gpt-oss-120b",

      OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY || "",
}

export default config;