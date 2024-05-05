import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseTransferSingle } from "@/parsing";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { client } from "../../src/clients/evmClient";
import { alchemyUrl } from "../../src/utils/constants";

describe("transferSingleEvent", {}, () => {
  const from = faker.finance.ethereumAddress();
  const timestamp = 10;
  const address = faker.finance.ethereumAddress() as `0x${string}`;
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
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args: {
        id: claimID,
        operator: address,
        from: address,
        to: address,
        value,
      },
    };

    const parsed = await parseTransferSingle(event);

    expect(parsed).toEqual({
      block_number: blockNumber,
      block_timestamp: timestamp,
      owner_address: address,
      token_id: claimID,
      value,
      type: "fraction",
    });
  });

  it("should fail when event is not a valid TransferSingleEvent", async () => {
    const args = {
      id: claimID,
      operator: address,
      from: address,
      to: address,
      value,
    };
    const event = {
      event: "TransferSingle",
      address: faker.finance.ethereumAddress() as `0x${string}`,
      blockNumber: 1n,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args,
    };

    const parsed1 = await parseTransferSingle({
      ...event,
      args: {
        ...args,
        id: "not a bigint",
      },
    });
    expect(parsed1).toBeUndefined();

    const parsed2 = await parseTransferSingle({
      ...event,
      args: {
        ...args,
        value: "not a bigint",
      },
    });
    expect(parsed2).toBeUndefined();

    const parsed3 = await parseTransferSingle({
      ...event,
      args: {
        ...args,
        to: 1,
      },
    });
    expect(parsed3).toBeUndefined();

    const parsed4 = await parseTransferSingle({
      ...event,
      args: {
        ...args,
        from: 1,
      },
    });
    expect(parsed4).toBeUndefined();

    const parsed5 = await parseTransferSingle({
      ...event,
      args: {
        ...args,
        operator: 1,
      },
    });
    expect(parsed5).toBeUndefined();

    const parsed6 = await parseTransferSingle({
      ...event,
      args: {
        ...args,
        operator: address,
        from: address,
        to: address,
        id: 1,
        value: 1,
      },
    });
    expect(parsed6).toBeUndefined();

    const parsed7 = await parseTransferSingle({
      ...event,
      args: {},
    });
    expect(parsed7).toBeUndefined();
  });
});
