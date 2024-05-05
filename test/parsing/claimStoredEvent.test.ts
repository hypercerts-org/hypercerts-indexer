import { describe, expect, it, vi } from "vitest";
import { parseClaimStoredEvent } from "../../src/parsing";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { client } from "../../src/clients/evmClient";

describe("claimStoredEvent", {}, () => {
  it("parses a claim stored event", {}, async () => {
    server.use(
      http.post(`https://eth-sepolia.g.alchemy.com/v2/*`, () => {
        return HttpResponse.json(0);
      }),
    );
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const uri = faker.internet.url();
    const claimID = faker.number.bigInt();
    const totalUnits = 2n;
    const event = {
      event: "ClaimStored",
      address,
      blockNumber: 1n,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args: {
        uri,
        claimID,
        totalUnits,
      },
    };

    const from = faker.finance.ethereumAddress();
    vi.spyOn(client, "getTransaction").mockImplementationOnce(
      async () =>
        ({
          from,
        }) as any,
    );

    const timestamp = 10;
    const spy = vi.spyOn(client, "getBlock").mockImplementationOnce(
      async () =>
        ({
          timestamp,
        }) as any,
    );
    expect(spy).toHaveBeenCalledWith({ blockNumber: 1n });

    const parsed = await parseClaimStoredEvent(event);

    expect(parsed).toEqual({
      contract_address: address,
      uri,
      block_timestamp: timestamp,
      units: totalUnits,
      creator_address: from,
      token_id: claimID,
    });
  });

  it(
    "returns undefined when the event is missing claimID or URI",
    {},
    async () => {
      const address = faker.finance.ethereumAddress();
      const event = {
        id: "0x3e7d7e4c4f3d5a7f2b3d6c5",
        event: "ClaimStored",
        address,
        args: {
          uri: "https://example.com/claim",
        },
      };

      const parsed = await parseClaimStoredEvent(event);

      expect(parsed).toBe(undefined);
    },
  );

  it("returns undefined when the event address is invalid", {}, async () => {
    const address = "invalid";
    const event = {
      id: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      event: "ClaimStored",
      address,
      args: {
        uri: "https://example.com/claim",
        claimID: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      },
    };

    const parsed = await parseClaimStoredEvent(event);

    expect(parsed).toBe(undefined);
  });
});
