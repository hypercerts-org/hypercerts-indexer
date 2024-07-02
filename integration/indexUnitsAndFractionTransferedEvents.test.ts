import { describe, expect, it, vi, beforeEach } from "vitest";
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
import { ZERO_ADDRESS } from "../src/utils/constants";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

describe("index unitsTransferred events mint and burn", async () => {
  const contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
  const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
  const cid = "ipfs://test_cid_mint_burn";

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

    const { data: contractEventsBefore } = await supabase
      .from("contract_events")
      .select("*");

    const { data: fractions } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .eq("owner_address", account);

    expect(fractions).toBeDefined();
    expect(fractions?.length).toBe(1);

    if (!fractions) throw Error("fractions is undefined");

    const fraction = fractions.filter(
      (fraction) => fraction.units === units.toString(),
    )[0];

    if (!fraction) throw Error("fraction is undefined");

    expect(BigInt(fraction.units as string)).toBe(units);
    expect(fraction.owner_address).toBe(account);

    const tokenId = fraction.token_id;

    const burnTx = await submitBurnTransaction({
      contractAddress,
      account,
      hypercertTokenId: tokenId,
    });

    await publicClient.waitForTransactionReceipt({ hash: burnTx });

    await testClient.mine({ blocks: 5 });

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
      .eq("token_id", tokenId)
      .single();

    expect(fractionAfterBurn.owner_address).toBe(ZERO_ADDRESS);
    expect(BigInt(fractionAfterBurn.units as string)).toBe(0n);
  });
});
