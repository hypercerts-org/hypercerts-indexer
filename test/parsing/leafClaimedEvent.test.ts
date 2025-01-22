import { faker } from "@faker-js/faker";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/clients/evmClient.js", () => ({
  getEvmClient: () => ({
    getTransaction: () =>
      Promise.resolve({
        from: "0x1234567890123456789012345678901234567890",
      }),
  }),
}));

import { Block } from "@hypercerts-org/chainsauce";
import { parseLeafClaimedEvent } from "../../src/parsing/parseLeafClaimedEvent.js";


describe("leafClaimedEvent", {}, () => {
  const chainId = 11155111;

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "LeafClaimed",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  it("parses a leaf claimed event", {}, async () => {
    const address = faker.finance.ethereumAddress();
    const tokenID = faker.number.bigInt();
    const leaf = faker.string.alphanumeric("10");
    const blockNumber = faker.number.bigInt();
    const from = "0x1234567890123456789012345678901234567890";
    const event = {
      event: "LeafClaimed",
      from,
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        tokenID,
        leaf,
      },
    };

    const [claim] = await parseLeafClaimedEvent({ event, context });

    expect(claim).toEqual({
      contract_address: address,
      creator_address: from,
      token_id: tokenID,
      leaf,
    });
  });

  it("throws when the event is missing leaf", async () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const tokenID = faker.number.bigInt();
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        tokenID,
      },
    };

    await expect(
      async () => await parseLeafClaimedEvent({ log: event, context }),
    ).rejects.toThrowError();
  });

  it("throws when the event is missing tokenID", async () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const leaf = faker.string.alphanumeric("10");
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        leaf,
      },
    };

    await expect(
      async () => await parseLeafClaimedEvent({ log: event, context }),
    ).rejects.toThrowError();
  });

  it("throws when the event address is invalid", {}, async () => {
    const address = "invalid";
    const event = {
      id: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      event: "LeafClaimed",
      address,
      params: {
        uri: "https://example.com/claim",
        claimID: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      },
    };

    await expect(
      async () => await parseLeafClaimedEvent({ log: event, context }),
    ).rejects.toThrowError();
  });
});
