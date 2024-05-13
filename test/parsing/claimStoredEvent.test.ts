import { describe, expect, it, vi } from "vitest";
import { parseClaimStoredEvent } from "../../src/parsing";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { client } from "../../src/clients/evmClient";

import { alchemyUrl } from "../resources/alchemyUrl";

describe("claimStoredEvent", {}, () => {
  it("parses a claim stored event", {}, async () => {
    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json(0);
      }),
    );
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const uri = faker.internet.url();
    const claimID = faker.number.bigInt();
    const totalUnits = faker.number.bigInt();
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "ClaimStored",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      args: {
        uri,
        claimID,
        totalUnits,
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

    const parsed = await parseClaimStoredEvent(event);

    expect(spy).toHaveBeenCalledWith({ blockNumber });
    expect(parsed).toEqual({
      contract_address: address,
      uri,
      block_timestamp: timestamp,
      units: totalUnits,
      creator_address: from,
      token_id: claimID,
    });
  });

  it("returns undefined when the event is missing claimID or URI", async () => {
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
  });

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
