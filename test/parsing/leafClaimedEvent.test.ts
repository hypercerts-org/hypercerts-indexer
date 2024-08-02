import { describe, expect, it, vi } from "vitest";
import { parseLeafClaimedEvent } from "../../src/parsing/parseLeafClaimedEvent.js";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env.js";
import { http, HttpResponse } from "msw";
import { client } from "../../src/clients/evmClient.js";

import { alchemyUrl } from "../resources/alchemyUrl.js";
import { getAddress } from "viem";
import { chainId } from "../../src/utils/constants.js";

describe("leafClaimedEvent", {}, () => {
  const block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "LeafClaimed",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  it("parses a leaf claimed event", {}, async () => {
    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json(0);
      }),
    );
    const address = faker.finance.ethereumAddress();
    const tokenID = faker.number.bigInt();
    const leaf = faker.string.alphanumeric("10");
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        tokenID,
        leaf,
      },
    };

    const from = getAddress(faker.finance.ethereumAddress());
    vi.spyOn(client, "getTransaction").mockImplementation(
      async () =>
        ({
          from,
        }) as any,
    );

    const timestamp = 10n;

    const [claim] = await parseLeafClaimedEvent({ event, context });

    expect(claim).toEqual({
      contract_address: address,
      creator_address: from,
      token_id: tokenID,
      leaf,
    });
  });

  it("throws when the event is missing leaf", async () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const tokenID = faker.number.bigInt();
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        tokenID,
      },
    };

    await expect(
      async () => await parseLeafClaimedEvent({ log: event, context }),
    ).rejects.toThrowError();
  });

  it("throws when the event is missing tokenID", async () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const leaf = faker.string.alphanumeric("10");
    const blockNumber = faker.number.bigInt();
    const event = {
      event: "LeafClaimed",
      address,
      blockNumber,
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        leaf,
      },
    };

    await expect(
      async () => await parseLeafClaimedEvent({ log: event, context }),
    ).rejects.toThrowError();
  });

  it("throws when the event address is invalid", {}, async () => {
    const address = "invalid";
    const event = {
      id: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      event: "LeafClaimed",
      address,
      params: {
        uri: "https://example.com/claim",
        claimID: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      },
    };

    await expect(
      async () => await parseLeafClaimedEvent({ log: event, context }),
    ).rejects.toThrowError();
  });
});
