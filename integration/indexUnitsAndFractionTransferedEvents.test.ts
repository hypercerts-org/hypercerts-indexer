import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { supabase } from "../src/clients/supabaseClient";
import { pool, publicClient, testClient } from "../test/helpers/evm";
import { indexClaimsStoredEvents } from "../src/indexer/indexClaimsStored";
import { parseEther } from "viem";
import { Database, Tables } from "../src/types/database.types";
import {
  submitBurnTransaction,
  submitMintClaimTransaction,
} from "../test/helpers/transactions";
import { indexUnitTransfers } from "../src/indexer/indexUnitTransfers";
import { indexTransferSingleEvents } from "../src/indexer/indexFractionTransfers";
import { createClient } from "@supabase/supabase-js";
import { alchemyApiKey, supabaseUrl } from "../src/utils/constants";
import { fetchLogs } from "@viem/anvil";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
);

describe("index unitsTransferred events mint and burn", async () => {
  const contractAddress = "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941";
  const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
  const units = parseEther("1");
  const cid = "ipfs://test_cid";

  beforeAll(async () => {
    await testClient.impersonateAccount({
      address: "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A",
    });
  });

  it("observes and stores ValueTransfer event", async () => {
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

    console.log(data);

    const fraction = data?.[0]!;
    expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
    expect(BigInt(fraction.units as string)).toBe(units);

    const burnTx = await submitBurnTransaction({
      contractAddress,
      account,
      hypercertTokenId: "340282366920938463463374607431768211457",
    });

    await publicClient.waitForTransactionReceipt({ hash: burnTx });

    await testClient.mine({ blocks: 5 });

    await indexTransferSingleEvents({
      batchSize: 1000n,
      eventName: "TransferSingle",
    });

    await indexUnitTransfers({
      batchSize: 1000n,
      eventName: "ValueTransfer",
    });

    const { data: dataAfterBurn } = await supabase
      .from("fractions")
      .select("*, token_id::text, units::text")
      .returns<Tables<"fractions">[]>();

    console.log(dataAfterBurn);

    expect(dataAfterBurn?.length).toBe(1);

    const fractionAfterBurn = dataAfterBurn?.[0]!;

    expect(fractionAfterBurn.token_id).toBe(
      "340282366920938463463374607431768211457",
    );
    expect(BigInt(fractionAfterBurn.units as string)).toBe(0n);
  });

  // it("observes and stores ValueTransfer event correctly after TransferSingle", async () => {
  //   const tx = await submitMintClaimTransaction({
  //     contractAddress,
  //     account,
  //     units,
  //     cid,
  //   });
  //
  //   await publicClient.waitForTransactionReceipt({ hash: tx });
  //
  //   await testClient.mine({ blocks: 5 });
  //
  //   await indexClaimsStoredEvents({
  //     batchSize: 1000n,
  //     eventName: "ClaimStored",
  //   });
  //
  //   await indexTransferSingleEvents({
  //     batchSize: 1000n,
  //     eventName: "TransferSingle",
  //   });
  //
  //   await indexUnitTransfers({
  //     batchSize: 1000n,
  //     eventName: "ValueTransfer",
  //   });
  //
  //   const { data } = await supabase
  //     .from("fractions")
  //     .select("*, token_id::text, units::text")
  //     .returns<Tables<"fractions">[]>();
  //
  //   expect(data?.length).toBe(1);
  //
  //   const fraction = data?.[0]!;
  //
  //   expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
  //   expect(BigInt(fraction.units as string)).toBe(units);
  // });
  //
  // it("handles a ValueTransfer event after a burn", async () => {
  //   const tx = await submitMintClaimTransaction({
  //     contractAddress,
  //     account,
  //     units,
  //     cid,
  //   });
  //
  //   await publicClient.waitForTransactionReceipt({ hash: tx });
  //
  //   await testClient.mine({ blocks: 5 });
  //
  //   await indexClaimsStoredEvents({
  //     batchSize: 1000n,
  //     eventName: "ClaimStored",
  //   });
  //
  //   await indexTransferSingleEvents({
  //     batchSize: 1000n,
  //     eventName: "TransferSingle",
  //   });
  //
  //   await indexUnitTransfers({
  //     batchSize: 1000n,
  //     eventName: "ValueTransfer",
  //   });
  //
  //   const burnTx = await submitBurnTransaction({
  //     contractAddress,
  //     account,
  //     hypercertTokenId: "340282366920938463463374607431768211457",
  //   });
  //
  //   await publicClient.waitForTransactionReceipt({ hash: burnTx });
  //
  //   await testClient.mine({ blocks: 5 });
  //
  //   await indexTransferSingleEvents({
  //     batchSize: 1000n,
  //     eventName: "TransferSingle",
  //   });
  //
  //   await indexUnitTransfers({
  //     batchSize: 1000n,
  //     eventName: "ValueTransfer",
  //   });
  //
  //   const { data } = await supabase
  //     .from("fractions")
  //     .select("*, token_id::text, units::text")
  //     .returns<Tables<"fractions">[]>();
  //
  //   console.log(data);
  //
  //   expect(data?.length).toBe(1);
  //
  //   const fraction = data?.[0]!;
  //
  //   expect(fraction.token_id).toBe("340282366920938463463374607431768211457");
  //   expect(BigInt(fraction.units as string)).toBe(0n);
  // });
});
