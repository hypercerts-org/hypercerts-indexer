import { afterAll, beforeEach, afterEach, vi } from "vitest";
import { anvilInstance } from "../test/helpers/evm";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/database.types";
import { supabaseUrl } from "../src/utils/constants";

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
);

export const cleanupSupabase = async () => {
  const removedFractions = await supabaseAdmin
    .from("fractions")
    .delete({ count: "exact" })
    .neq("fraction_id", "")
    .select();
  const removedClaims = await supabaseAdmin
    .from("claims")
    .delete({ count: "exact" })
    .neq("hypercert_id", "")
    .select();

  const resetLastBlockIndexed = await supabaseAdmin
    .from("contract_events")
    .update({ last_block_indexed: "0" })
    .not("last_block_indexed", "eq", 0)
    .select();

  console.log("Removed fractions: ", removedFractions.count);
  console.log("Removed claims: ", removedClaims.count);
  console.log("Reset last block indexed: ", resetLastBlockIndexed.count);
};

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.fromJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

beforeEach(async () => {});

afterEach(async () => {
  await cleanupSupabase();

  await anvilInstance.restart();
});

afterAll(async () => {
  await anvilInstance.stop();

  vi.clearAllMocks();
});
