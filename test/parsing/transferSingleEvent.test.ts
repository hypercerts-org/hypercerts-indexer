import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseTransferSingle } from "@/parsing";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { client } from "@/clients/evmClient.js";

import { alchemyUrl } from "../resources/alchemyUrl.js";
import { getAddress } from "viem";

describe("transferSingleEvent", {}, () => {
  const from = getAddress(faker.finance.ethereumAddress());
  const timestamp = 10;
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
      args: {
        id: claimID,
        operator: operatorAddress,
        from: fromAddress,
        to: toAddress,
        value,
      },
    };

    const parsed = await parseTransferSingle(event);

    expect(parsed).toMatchObject({
      contract_address: contractAddress,
      last_update_block_number: blockNumber,
      last_update_block_timestamp: timestamp,
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
        await parseTransferSingle({
          ...event,
          args: {
            ...args,
            id: "not a bigint",
          },
        }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingle({
        ...event,
        args: {
          ...args,
          value: "not a bigint",
        },
      }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingle({
        ...event,
        args: {
          ...args,
          to: 1,
        },
      }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingle({
        ...event,
        args: {
          ...args,
          from: 1,
        },
      }),
    ).rejects.toThrowError();

    await expect(
      parseTransferSingle({
        ...event,
        args: {
          ...args,
          operator: 1,
        },
      }),
    ).rejects.toThrowError();
    await expect(
      parseTransferSingle({
        ...event,
        args: {},
      }),
    ).rejects.toThrowError();
  });
});
