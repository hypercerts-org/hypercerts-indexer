import { describe, expect, it, vi } from "vitest";
import { parseLeafClaimedEvent } from "../../src/parsing";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { client } from "../../src/clients/evmClient";

import { alchemyUrl } from "../resources/alchemyUrl";

describe("leafClaimedEvent", {}, () => {
  it("parses a leaf claimed event", {}, async () => {
    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json(0);
      }),
    );
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const tokenID = faker.number.bigInt();
    const leaf = faker.string.alphanumeric("10");
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args: {
        tokenID,
        leaf,
      },
    };

    const from = faker.finance.ethereumAddress();
    vi.spyOn(client, "getTransaction").mockImplementation(
      async () =>
        ({
          from,
        }) as any,
    );

    const timestamp = 10;
    const spy = vi.spyOn(client, "getBlock").mockImplementation(
      async () =>
        ({
          timestamp,
        }) as any,
    );

    const parsed = await parseLeafClaimedEvent(event);

    expect(spy).toHaveBeenCalledWith({ blockNumber });
    expect(parsed).toEqual({
      contract_address: address,
      creator_address: from,
      block_timestamp: timestamp,
      token_id: tokenID,
      leaf,
    });
  });

  it("returns undefined when the event is missing leaf", async () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const tokenID = faker.number.bigInt();
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args: {
        tokenID,
      },
    };

    const parsed = await parseLeafClaimedEvent(event);

    expect(parsed).toBe(undefined);
  });

  it("returns undefined when the event is missing tokenID", async () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const leaf = faker.string.alphanumeric("10");
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args: {
        leaf,
      },
    };

    const parsed = await parseLeafClaimedEvent(event);

    expect(parsed).toBe(undefined);
  });

  it("returns undefined when the event address is invalid", {}, async () => {
    const address = "invalid";
    const event = {
      id: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      event: "LeafClaimed",
      address,
      args: {
        uri: "https://example.com/claim",
        claimID: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      },
    };

    const parsed = await parseLeafClaimedEvent(event);

    expect(parsed).toBe(undefined);
  });
});
