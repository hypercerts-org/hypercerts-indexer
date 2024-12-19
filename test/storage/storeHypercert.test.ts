import { describe, expect, it } from "vitest";
import { storeClaimStored } from "../../src/storage/storeClaimStored.js";
import { generateClaim } from "../helpers/factories.js";
import { Block } from "@hypercerts-org/chainsauce";
import { faker } from "@faker-js/faker";
import { getEvmClient } from "../../src/clients/evmClient.js";

describe("storeHypercert", {}, async () => {
  const chainId = 11155111;
  
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

  it("creates two query calls for a single claim", {}, async () => {
    const storedClaim = await storeClaimStored({
      data: [claim],
      context,
    });

    expect(storedClaim.length).toBe(2);

    // first request should be a insert into claims
    expect(storedClaim[0].sql).toContain('insert into "claims"');
    // second request should be a update table contract_events
    expect(storedClaim[1].sql).toContain('update "contract_events"');
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
