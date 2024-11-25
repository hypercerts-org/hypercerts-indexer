import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseTransferSingleEvent } from "../../src/parsing/parseTransferSingleEvent.js";
import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { getEvmClient } from "../../src/clients/evmClient.js";
import { server } from "../setup-env.js";

import { alchemyUrl } from "../resources/alchemyUrl.js";
import { getAddress } from "viem";
import { Block } from "@hypercerts-org/chainsauce";

describe("transferSingleEvent", {}, () => {
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
    event_name: "TransferSingle",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  const from = getAddress(faker.finance.ethereumAddress());
  const timestamp = 10n;
  const contractAddress = getAddress(faker.finance.ethereumAddress());
  const operatorAddress = getAddress(faker.finance.ethereumAddress());
  const fromAddress = getAddress(faker.finance.ethereumAddress());
  const toAddress = getAddress(faker.finance.ethereumAddress());
  const claimID = faker.number.bigInt();
  const blockNumber = 1n;
  const value = 3n;

  beforeEach(() => {
    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json(0);
      }),
    );
  });
  vi.spyOn(client, "getTransaction").mockImplementation(
    async () =>
      ({
        from,
      }) as any,
  );

  vi.spyOn(client, "getBlock").mockImplementation(
    async () =>
      ({
        timestamp,
      }) as any,
  );
  it("parses a transfer single event", {}, async () => {
    const event = {
      event: "TransferSingle",
      address: contractAddress,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        id: claimID,
        operator: operatorAddress,
        from: fromAddress,
        to: toAddress,
        value,
      },
    };

    const [transfer] = await parseTransferSingleEvent({ event, context });

    expect(transfer).toMatchObject({
      contract_address: contractAddress,
      from_owner_address: fromAddress,
      to_owner_address: toAddress,
      token_id: claimID,
      value,
    });
  });

  it("should fail when event is not a valid TransferSingleEvent", async () => {
    const args = {
      id: claimID,
      operator: operatorAddress,
      from: fromAddress,
      to: toAddress,
      value,
    };
    const event = {
      event: "TransferSingle",
      address: faker.finance.ethereumAddress() as `0x${string}`,
      blockNumber: 1n,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args,
    };

    await expect(
      async () =>
        await parseTransferSingleEvent({
          ...event,
          args: {
            ...args,
            id: "not a bigint",
          },
        }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingleEvent({
        ...event,
        args: {
          ...args,
          value: "not a bigint",
        },
      }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingleEvent({
        ...event,
        args: {
          ...args,
          to: 1,
        },
      }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingleEvent({
        ...event,
        args: {
          ...args,
          from: 1,
        },
      }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingleEvent({
        ...event,
        args: {
          ...args,
          operator: 1,
        },
      }),
    ).rejects.toThrowError();
    await expect(
      parseTransferSingleEvent({
        ...event,
        args: {},
      }),
    ).rejects.toThrowError();
  });
});
