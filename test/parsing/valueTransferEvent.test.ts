import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { parseValueTransfer } from "@/parsing/valueTransferEvent.js";
import { client } from "@/clients/evmClient.js";
import { alchemyUrl } from "../resources/alchemyUrl";
import { getAddress } from "viem";

describe("valueTransferEvent", () => {
  const claimID = faker.number.bigInt();
  const fromTokenID = faker.number.bigInt();
  const toTokenID = faker.number.bigInt();
  const value = faker.number.bigInt();
  const address = getAddress(faker.finance.ethereumAddress());
  const blockNumber = faker.number.bigInt();
  const timestamp = faker.number.bigInt();

  const event = {
    address,
    blockNumber,
    args: {
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
    const parsed = await parseValueTransfer(event);

    if (!parsed) {
      expect.fail("couldn't parse event");
    }

    expect(parsed.from_token_id).toEqual(fromTokenID);
    expect(parsed.to_token_id).toEqual(toTokenID);
    expect(parsed.last_update_block_timestamp).toEqual(timestamp);
    expect(parsed.units).toEqual(value);
  });

  it("fails if event is invalid", async () => {
    await expect(
      parseValueTransfer({
        ...event,
        address: "not an address",
      }),
    ).rejects.toThrow();

    await expect(
      parseValueTransfer({
        ...event,
        blockNumber: "not an int",
      }),
    ).rejects.toThrow();
  });

  it("fails if args are invalid", async () => {
    await expect(
      parseValueTransfer({
        ...event,
        args: {
          ...event.args,
          claimID: "not an int",
        },
      }),
    ).rejects.toThrow();

    await expect(
      parseValueTransfer({
        ...event,
        args: {
          ...event.args,
          fromTokenID: "not an int",
        },
      }),
    ).rejects.toThrow();

    await expect(
      parseValueTransfer({
        ...event,
        args: {
          ...event.args,
          toTokenID: "not an int",
        },
      }),
    ).rejects.toThrow();

    await expect(
      parseValueTransfer({
        ...event,
        args: {
          ...event.args,
          value: "not an int",
        },
      }),
    ).rejects.toThrow();
  });
});
