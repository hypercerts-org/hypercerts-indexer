import { assertExists } from "./assertExists.js";

export const chainId = Number(assertExists(process.env.CHAIN_ID, "Chain ID"));

export const alchemyApiKey = assertExists(
  process.env.ALCHEMY_API_KEY,
  "Alchemy API key",
);

export const ankrApiKey = assertExists(
  process.env.ANKR_API_KEY,
  "Ankr API key",
);

export const infuraApiKey = assertExists(
  process.env.INFURA_API_KEY,
  "Infura API key",
);

export const drpcApiPkey = assertExists(
  process.env.DRPC_API_KEY,
  "dRPC API KEY",
);

export const port = Number(assertExists(process.env.PORT, "Port"));

export const supabaseApiKey = assertExists(
  process.env.SUPABASE_CACHING_SERVICE_API_KEY,
  "Supabase caching service API key",
);

export const supabaseUrl = assertExists(
  process.env.SUPABASE_CACHING_DB_URL,
  "Supabase caching DB URL",
);

export const batchSize = BigInt(
  assertExists(process.env.BATCH_SIZE, "Batch size"),
);

export const delay = Number(assertExists(process.env.DELAY, "Delay"));
