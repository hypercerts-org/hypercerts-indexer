import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/clients/evmClient.js", () => ({
  getEvmClient: () => ({
    readContract: () =>
      Promise.resolve("0x0000000000000000000000000000000000000000"),
    getTransaction: () =>
      Promise.resolve({
        from: "0x1234567890123456789012345678901234567890",
      }),
    getTransactionReceipt: () =>
      Promise.resolve({
        logs: [],
      }),
  }),
}));

vi.mock("viem", async (importOriginal) => {
  const original = await importOriginal();
  return {
    // @ts-expect-error - spread types may only be created from object types
    ...original,
    parseEventLogs: vi.fn(),
    // parseEventLogs: vi.fn().mockReturnValue([
    //   {
    //     eventName: "TransferSingle",
    //     args: {
    //       operator: "0x1234567890123456789012345678901234567891",
    //     },
    //   },
    // ]),
  };
});

import { fa, faker } from "@faker-js/faker";
import { Block } from "@hypercerts-org/chainsauce";
import { getAddress } from "viem";
import * as viem from "viem";
import { parseClaimStoredEvent } from "../../src/parsing/parseClaimStoredEvent.js";
import { generateClaimStoredEvent } from "../helpers/factories.js";

describe("claimStoredEvent", {}, () => {
  const chainId = 11155111;

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "ClaimStored",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  it("parses a claim stored event", {}, async () => {
    const operator = getAddress(faker.finance.ethereumAddress());
    vi.spyOn(viem, "parseEventLogs").mockImplementationOnce(() => [
      // @ts-expect-error - mock implementation
      {
        eventName: "TransferSingle",
        args: {
          operator,
        },
      },
    ]);
    const from = "0x1234567890123456789012345678901234567890";
    const event = {
      event: "ClaimStored",
      from,
      address: getAddress(faker.finance.ethereumAddress()),
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        uri: faker.internet.url(),
        claimID: faker.number.bigInt(),
        totalUnits: faker.number.bigInt(),
      },
    };

    const [claim] = await parseClaimStoredEvent({ event, context });

    expect(claim).toEqual({
      contracts_id: context.contracts_id,
      creator_address: operator,
      owner_address: "0x0000000000000000000000000000000000000000",
      uri: event.params.uri,
      units: event.params.totalUnits,
      token_id: event.params.claimID,
    });
  });

  it("throws when the event is shaped incorrectly", async () => {
    const wrongArgs = generateClaimStoredEvent();
    // @ts-expect-error - wrong args
    wrongArgs.args = "wrong";

    await expect(
      async () => await parseClaimStoredEvent(wrongArgs),
    ).rejects.toThrowError();
  });

  it("throws when the event address is invalid", {}, async () => {
    const mockEvent = generateClaimStoredEvent({ address: "0xinvalid" });

    await expect(
      async () => await parseClaimStoredEvent({ log: mockEvent, context }),
    ).rejects.toThrowError();
  });
});
