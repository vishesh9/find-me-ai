import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH ?? "visibility.db",
  // LLM provider selection and keys are read via configRepo (env or config table).
  // Supported: LLM_PROVIDER=gemini|openai, GEMINI_API_KEY, GEMINI_MODEL, OPENAI_API_KEY, OPENAI_MODEL, TEMPERATURE
};
