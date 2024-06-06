import { assertExists } from "./assertExists.js";

export const chainId = Number(assertExists(process.env.CHAIN_ID, "Chain ID"));

export const alchemyApiKey = assertExists(
  process.env.ALCHEMY_API_KEY,
  "Alchemy API key",
);

export const infuraApiKey = assertExists(
  process.env.INFURA_API_KEY,
  "Infura API key",
);

export const port = Number(assertExists(process.env.PORT, "Port"));

export const supabaseApiKey = assertExists(
  process.env.SUPABASE_SERVICE_API_KEY,
  "Supabase API key",
);

export const supabaseUrl = assertExists(
  process.env.SUPABASE_DB_URL,
  "Supabase URL",
);

export const batchSize = BigInt(
  assertExists(process.env.BATCH_SIZE, "Batch size"),
);

export const delay = Number(assertExists(process.env.DELAY, "Delay"));
