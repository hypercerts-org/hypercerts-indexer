import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../src/clients/supabaseClient";
import { anvilInstance, publicClient, testClient } from "../test/helpers/evm";
import { indexClaimsStoredEvents } from "../src/indexer/indexClaimsStored";
import {
  submitBurnTransaction,
  submitMintClaimTransaction,
} from "../test/helpers/transactions";
import { indexValueTransfer } from "../src/indexer/indexValueTransfer";
import { indexTransferSingleEvents } from "../src/indexer/indexFractionTransfers";
import { faker } from "@faker-js/faker";
import { cleanupSupabase } from "./setup-env";
import { parseEventLogs } from "viem";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

describe("index unitsTransferred events mint and burn", async () => {
  const contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
  const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
  const cid = "ipfs://test_cid_events_mint_and_burn";

  beforeEach(async () => {
    await cleanupSupabase();

    await anvilInstance.restart();
  });

  it("observes and stores ValueTransfer event", async () => {
    const units = faker.number.bigInt();

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

    await indexValueTransfer({
      batchSize: 1000n,
      eventName: "ValueTransfer",
    });

    await indexTransferSingleEvents({
      batchSize: 1000n,
      eventName: "TransferSingle",
    });

    const { data: fraction } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .single();

    expect(fraction).toBeDefined();
    if (!fraction) throw Error("fraction is undefined");

    expect(BigInt(fraction.units as string)).toBe(units);
    expect(fraction.owner_address).toBe(account);

    const burnTx = await submitBurnTransaction({
      contractAddress,
      account,
      hypercertTokenId: fraction.token_id,
    });

    await publicClient.waitForTransactionReceipt({
      hash: burnTx,
    });

    await indexTransferSingleEvents({
      batchSize: 1000n,
      eventName: "TransferSingle",
    });

    await indexValueTransfer({
      batchSize: 1000n,
      eventName: "ValueTransfer",
    });

    const { data: fractionAfterBurn } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .eq("token_id", fraction.token_id)
      .single();

    if (!fractionAfterBurn) throw Error("fractionAfterBurn is undefined");

    expect(BigInt(fractionAfterBurn.units as string)).toBe(units);
    expect(fractionAfterBurn.owner_address).toBe(
      "0x0000000000000000000000000000000000000000",
    );
  });
});
