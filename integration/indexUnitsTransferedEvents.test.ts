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
import { parseEther } from "viem";
import { Tables } from "../src/types/database.types";
import {
  submitMintClaimTransaction,
  submitSplitTransaction,
} from "../test/helpers/transactions";
import { indexUnitTransfers } from "../src/indexer/indexUnitTransfers";
import { indexTransferSingleEvents } from "../src/indexer/indexFractionTransfers";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

describe("index unitsTransfered events", async () => {
  beforeAll(async () => {
    await testClient.impersonateAccount({
      address: "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A",
    });
  });

  it("observes and stores ValueTransfer event", async () => {
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

    await indexUnitTransfers({
      batchSize: 1000n,
      eventName: "ValueTransfer",
    });

    const { data } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .returns<Tables<"fractions">[]>();

    expect(data?.length).toBe(1);

    const fraction = data?.[0]!;
    expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
    expect(BigInt(fraction.units as string)).toBe(units);
  });

  it("observes and stores ValueTransfer event correctly after TransferSingle", async () => {
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

    await indexTransferSingleEvents({
      batchSize: 1000n,
      eventName: "TransferSingle",
    });

    await indexUnitTransfers({
      batchSize: 1000n,
      eventName: "ValueTransfer",
    });

    const { data } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .returns<Tables<"fractions">[]>();

    expect(data?.length).toBe(1);

    const fraction = data?.[0]!;

    console.log(fraction);
    expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
    expect(BigInt(fraction.units as string)).toBe(units);
  });
});
