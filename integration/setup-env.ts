import { alchemyApiKey, supabaseUrl } from "../src/utils/constants";
import { pool, testClient } from "../test/helpers/evm";
import { afterAll, afterEach, beforeEach, expect, vi } from "vitest";
import { fetchLogs } from "@viem/anvil";
import { createClient } from "@supabase/supabase-js";
import { Database, Tables } from "../src/types/database.types";
import { supabase } from "../src/clients/supabaseClient";

const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
);

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

// TODO improve waiting on cleanup
beforeEach(async (context) => {
  await testClient.reset({
    jsonRpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
    blockNumber: 4421945n,
  });

  const { data: clearClaims } = await supabaseAdmin.rpc("sql", {
    query: "TRUNCATE TABLE public.claims RESTART IDENTITY",
  });

  const { data: clearFractions } = await supabaseAdmin.rpc("sql", {
    query: "TRUNCATE TABLE public.fractions RESTART IDENTITY",
  });

  context.onTestFailed(async () => {
    const logs = await fetchLogs("http://localhost:8545", pool);
    console.log(...logs.slice(-20));
  });

  if (clearClaims && clearFractions) {
    const { data: claims } = await supabase
      .from("claims")
      .select("*")
      .returns<Tables<"claims">[]>();

    expect(claims?.length).toBe(0);

    const { data: fractions } = await supabase
      .from("fractions")
      .select("*")
      .returns<Tables<"fractions">[]>();

    expect(fractions?.length).toBe(0);
  }
});

afterEach(async (context) => {
  await testClient.reset({
    jsonRpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
    blockNumber: 4421945n,
  });

  await supabaseAdmin.rpc("sql", {
    query: "TRUNCATE TABLE public.claims RESTART IDENTITY",
  });

  await supabaseAdmin.rpc("sql", {
    query: "TRUNCATE TABLE public.fractions RESTART IDENTITY",
  });

  context.onTestFailed(async () => {
    const logs = await fetchLogs("http://localhost:8545", pool);
    console.log(...logs.slice(-20));
  });
});

afterAll(async () => {
  await supabaseAdmin.rpc("sql", {
    query: "TRUNCATE TABLE public.claims RESTART IDENTITY",
  });

  await supabaseAdmin.rpc("sql", {
    query: "TRUNCATE TABLE public.fractions RESTART IDENTITY",
  });
  vi.clearAllMocks();
});
