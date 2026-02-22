import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    temperature: process.env.TEMPERATURE ?? "0",
  },
  dbPath: process.env.DB_PATH ?? "visibility.db",
};
