import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { supabase } from "../src/clients/supabaseClient";
import { publicClient, testClient } from "../test/helpers/evm";
import { indexClaimsStoredEvents } from "../src/indexer/indexClaimsStored";
import { getAddress, parseEther } from "viem";
import { Database, Tables } from "../src/types/database.types";
import { submitMintClaimTransaction } from "../test/helpers/transactions";
import { createClient } from "@supabase/supabase-js";
import { alchemyApiKey, supabaseUrl } from "../src/utils/constants";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

describe("index claimStored events", async () => {
  const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  );
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeAll(async () => {
    await testClient.impersonateAccount({
      address: "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A",
    });
  });

  beforeEach(async () => {
    await supabaseAdmin.rpc("sql", {
      query: "TRUNCATE TABLE public.claims RESTART IDENTITY",
    });
    await testClient.reset({
      jsonRpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      blockNumber: 4421945n,
    });
  });

  afterAll(async () => {
    await supabaseAdmin.rpc("sql", {
      query: "TRUNCATE TABLE public.claims RESTART IDENTITY",
    });
    vi.clearAllMocks();
  });

  it("observes and stores mintClaim event", async () => {
    const contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
    const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
    const units = parseEther("1");
    const cid = "ipfs://test_cid";
    const tx = await submitMintClaimTransaction({
      contractAddress,
      account,
      units,
      cid,
    });

    await publicClient.waitForTransactionReceipt({ hash: tx });

    await testClient.mine({ blocks: 5 });

    await indexClaimsStoredEvents({
      batchSize: 1000n,
      eventName: "ClaimStored",
    });

    const { data } = await supabase
      .from("claims")
      .select("*, token_id::text, units")
      .returns<Tables<"claims">[]>();

    expect(data?.length).toBe(1);

    const claim = data?.[0]!;
    expect(claim.token_id).toBe("340282366920938463463374607431768211456");
    // @ts-expect-error typings
    expect(BigInt(claim.units)).toBe(units);
    expect(claim.uri).toBe(cid);
    expect(getAddress(claim.creator_address!)).toBe(account);
    expect(claim.owner_address).toBe(ZERO_ADDRESS);
    expect(claim.hypercert_id).toBe(
      publicClient.chain.id
        .toString()
        .concat("-", contractAddress, "-", claim.token_id.toString()),
    );
  });

  it("observes and stores multiple mintClaim events with identical input as two entries", async () => {
    const contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
    const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
    const units = parseEther("1");
    const cid = "ipfs://test_cid";
    const tx_one = await submitMintClaimTransaction({
      contractAddress,
      account,
      units,
      cid,
    });

    const tx_two = await submitMintClaimTransaction({
      contractAddress,
      account,
      units,
      cid,
    });

    await publicClient.waitForTransactionReceipt({ hash: tx_one });
    await publicClient.waitForTransactionReceipt({ hash: tx_two });

    await indexClaimsStoredEvents({
      batchSize: 1000n,
      eventName: "ClaimStored",
    });

    const { data } = await supabase
      .from("claims")
      .select("*, token_id::text, units")
      .returns<Tables<"claims">[]>();

    expect(data?.length).toBe(2);

    const claim = data?.[1]!;
    expect(claim.token_id).toBe("680564733841876926926749214863536422912");
    // @ts-expect-error typings
    expect(BigInt(claim.units)).toBe(units);
    expect(claim.uri).toBe(cid);
    expect(getAddress(claim.creator_address!)).toBe(account);
    expect(claim.owner_address).toBe(ZERO_ADDRESS);
    expect(claim.hypercert_id).toBe(
      publicClient.chain.id
        .toString()
        .concat("-", contractAddress, "-", claim.token_id.toString()),
    );
  });
});
