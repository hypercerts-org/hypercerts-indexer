import { describe, expect, it } from "vitest";
import { storeClaimStored } from "../../src/storage/storeClaimStored.js";
import { generateClaim } from "../helpers/factories.js";
import { Block } from "@hypercerts-org/chainsauce";
import { faker } from "@faker-js/faker";
import { getEvmClient } from "../../src/clients/evmClient.js";

describe("storeHypercert", {}, async () => {
  const chainId = 11155111;
  const client = getEvmClient(chainId);
  
  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "ClaimStored",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  const claim = generateClaim();

  it("store hypercert data  in DB", {}, async () => {
    const storedClaim = await storeClaimStored({
      data: [claim],
      context,
    });

    expect(storedClaim.length).toBe(1);
  });

  it("should throw an error if creator address is invalid", async () => {
    const wrongAddress = {
      ...claim,
      creator_address: "0xWRONGADDRESS" as `0x${string}`,
    };

    await expect(
      async () =>
        await storeClaimStored({
          data: [wrongAddress],
          context,
        }),
    ).rejects.toThrowError();
  });
});
