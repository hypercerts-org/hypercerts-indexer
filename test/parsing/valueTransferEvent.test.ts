import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { parseValueTransfer } from "../../src/parsing/valueTransferEvent";
import { client } from "../../src/clients/evmClient";
import { alchemyUrl } from "../resources/alchemyUrl";

describe("valueTransferEvent", () => {
  const claimID = faker.number.bigInt();
  const fromTokenID = faker.number.bigInt();
  const toTokenID = faker.number.bigInt();
  const value = faker.number.bigInt();
  const address = faker.finance.ethereumAddress();
  const blockNumber = faker.number.bigInt();
  const timestamp = faker.number.int();

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
    expect(parsed.block_timestamp).toEqual(timestamp);
    expect(parsed.units).toEqual(value);
  });

  it("fails if event is invalid", async () => {
    const parsed1 = await parseValueTransfer({
      ...event,
      address: "not an address",
    });
    expect(parsed1).toBeUndefined();

    const parsed2 = await parseValueTransfer({
      ...event,
      blockNumber: "not an int",
    });
    expect(parsed2).toBeUndefined();
  });

  it("fails if args are invalid", async () => {
    const parsed1 = await parseValueTransfer({
      ...event,
      args: {
        ...event.args,
        fromTokenID: "not an int",
      },
    });
    expect(parsed1).toBeUndefined();

    const parsed2 = await parseValueTransfer({
      ...event,
      args: {
        ...event.args,
        claimID: "not a int",
      },
    });
    expect(parsed2).toBeUndefined();

    const parsed3 = await parseValueTransfer({
      ...event,
      args: {
        ...event.args,
        toTokenID: "not a int",
      },
    });
    expect(parsed3).toBeUndefined();

    const parsed4 = await parseValueTransfer({
      ...event,
      args: {
        ...event.args,
        value: "not a int",
      },
    });
    expect(parsed4).toBeUndefined();
  });
});
