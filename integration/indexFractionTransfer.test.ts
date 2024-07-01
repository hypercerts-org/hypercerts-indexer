import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../src/clients/supabaseClient";
import { anvilInstance, publicClient, testClient } from "../test/helpers/evm";
import { indexClaimsStoredEvents } from "../src/indexer/indexClaimsStored";
import { getAddress, parseEther } from "viem";
import { Tables } from "../src/types/database.types";
import {
  submitMintClaimTransaction,
  submitTransferTransaction,
} from "../test/helpers/transactions";
import { indexValueTransfer } from "../src/indexer/indexValueTransfer";
import { indexTransferSingleEvents } from "../src/indexer/indexFractionTransfers";
import { faker } from "@faker-js/faker";
import { cleanupSupabase, supabaseAdmin } from "./setup-env";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

describe("index TransferSingle events", async () => {
  const contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
  const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
  const units = parseEther("1");
  const cid = "ipfs://test_cid_transfer_single";

  beforeEach(async () => {
    await cleanupSupabase();

    await anvilInstance.restart();
  });

  it("observes and stores TransferSingle event", async () => {
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

    const { data } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .returns<Tables<"fractions">[]>();

    expect(data?.length).toBe(1);

    const fraction = data?.[0];

    expect(fraction).toBeDefined();

    if (!fraction) throw Error("fraction is undefined");

    expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
    expect(fraction.owner_address).toBe(account);
  });

  it("observes and stores TransferSingle  event correctly after ValueTransfer", async () => {
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

    const { data } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .returns<Tables<"fractions">[]>();

    expect(data?.length).toBe(1);

    const fraction = data?.[0];

    expect(fraction).toBeDefined();

    if (!fraction) throw Error("fraction is undefined");

    expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
    expect(BigInt(fraction.units as string)).toBe(units);
    expect(fraction.owner_address).toBe(account);
  });

  it("observes and handles a transfer between accounts in the same batch of blocks", async () => {
    const tx = await submitMintClaimTransaction({
      contractAddress,
      account,
      units,
      cid,
    });

    await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    const recipient = getAddress(faker.finance.ethereumAddress());

    await testClient.mine({ blocks: 5 });

    const tokenId = "340282366920938463463374607431768211457";

    const mintTx = await submitTransferTransaction({
      contractAddress,
      account,
      hypercertTokenId: tokenId,
      recipient,
    });

    await publicClient.waitForTransactionReceipt({
      hash: mintTx,
    });

    await testClient.mine({ blocks: 5 });

    await indexClaimsStoredEvents({
      batchSize: 1000n,
      eventName: "ClaimStored",
    });

    await indexTransferSingleEvents({
      batchSize: 1000n,
      eventName: "TransferSingle",
    });
    await indexValueTransfer({
      batchSize: 1000n,
      eventName: "ValueTransfer",
    });

    const { data: fraction } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .single();

    expect(fraction).toBeDefined();

    if (!fraction) throw Error("fraction is undefined");

    expect(BigInt(fraction.units as string)).toBe(units);
    expect(fraction.owner_address).toBe(recipient);
  });
});
