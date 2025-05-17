import { assertExists } from "./assertExists.js";

export enum Environment {
  TEST = "test",
  PRODUCTION = "production",
}

export const environment = assertExists(process.env.ENVIRONMENT, "Environment");

export const alchemyApiKey = assertExists(
  process.env.ALCHEMY_API_KEY,
  "Alchemy API key",
);

export const drpcApiPkey = assertExists(
  process.env.DRPC_API_KEY,
  "dRPC API KEY",
);

export const filecoinApiKey = assertExists(
  process.env.FILECOIN_API_KEY,
  "Filecoin API KEY",
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

export const supabaseDataUrl = assertExists(
  process.env.SUPABASE_DATA_DB_URL,
  "Supabase data DB URL",
);
export const supabaseDataServiceApiKey = assertExists(
  process.env.SUPABASE_DATA_SERVICE_API_KEY,
  "Supabase data service API key",
);

export const batchSize = BigInt(
  assertExists(process.env.BATCH_SIZE, "Batch size"),
);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const localCachingDbUrl = assertExists(
  process.env.LOCAL_CACHING_DB_URL,
  "Local caching DB URL",
);

export const dbUrl = assertExists(process.env.DB_URL, "DB URL");
