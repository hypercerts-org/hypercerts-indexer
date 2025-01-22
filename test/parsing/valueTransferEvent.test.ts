import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env.js";
import { http, HttpResponse } from "msw";
import { parseValueTransferEvent } from "../../src/parsing/parseValueTransferEvent.js";
import { alchemyUrl } from "../resources/alchemyUrl.js";
import { getAddress } from "viem";
import { Block } from "@hypercerts-org/chainsauce";
import { getEvmClient } from "../../src/clients/evmClient.js";

vi.mock("../../src/clients/evmClient.js", () => ({
  getEvmClient: () => ({
    getTransaction: () =>
      Promise.resolve({
        from: "0x1234567890123456789012345678901234567890",
        to: "0x0987654321098765432109876543210987654321",
      }),
    getBlock: () =>
      Promise.resolve({
        timestamp: Date.now(),
        number: 1234567,
        hash: "0xabcdef1234567890",
      }),
  }),
}));

describe("valueTransferEvent", () => {
  const chainId = 11155111;
  const client = getEvmClient(chainId);

  const claimID = faker.number.bigInt();
  const fromTokenID = faker.number.bigInt();
  const toTokenID = faker.number.bigInt();
  const value = faker.number.bigInt();
  const address = getAddress(faker.finance.ethereumAddress());
  const timestamp = faker.number.bigInt();

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "ValueTransfer",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  const event = {
    address,
    params: {
      claimID,
      fromTokenID,
      toTokenID,
      value,
    },
  };

  beforeEach(() => {
    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json(0);
      }),
    );

    vi.spyOn(client, "getBlock").mockImplementation(
      async () =>
        ({
          timestamp,
        }) as any,
    );
  });

  it("parses valueTransferEvent", async () => {
    const [transfer] = await parseValueTransferEvent({ event, context });

    if (!transfer) {
      expect.fail("couldn't parse event");
    }

    expect(transfer.from_token_id).toEqual(fromTokenID);
    expect(transfer.to_token_id).toEqual(toTokenID);
    expect(transfer.units).toEqual(value);
  });

  it("fails if event is invalid", async () => {
    await expect(
      parseValueTransferEvent({
        event: { dummy: "object" },
        context,
      }),
    ).rejects.toThrow();
  });

  it("fails if args are invalid", async () => {
    await expect(
      parseValueTransferEvent({
        event: {
          ...event,
          params: {
            ...event.params,
            claimID: "Not a number",
          },
        },
        context,
      }),
    ).rejects.toThrow();
  });
});
