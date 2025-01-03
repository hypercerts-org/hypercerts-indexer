import { faker } from "@faker-js/faker";
import { Block } from "@hypercerts-org/chainsauce";
import { http, HttpResponse } from "msw";
import { getAddress } from "viem";
import { describe, expect, it, vi } from "vitest";
import { getEvmClient } from "../../src/clients/evmClient.js";
import { parseClaimStoredEvent } from "../../src/parsing/parseClaimStoredEvent.js";
import { generateClaimStoredEvent } from "../helpers/factories.js";
import { alchemyUrl } from "../resources/alchemyUrl.js";
import { server } from "../setup-env.js";

describe("claimStoredEvent", {}, () => {
  const chainId = 11155111;
  const client = getEvmClient(chainId);

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "ClaimStored",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  vi.spyOn(client, "readContract").mockResolvedValue(
    "0x0000000000000000000000000000000000000000",
  );

  it("parses a claim stored event", {}, async () => {
    const from = getAddress(faker.finance.ethereumAddress());
    const event = {
      event: "ClaimStored",
      from,
      address: getAddress(faker.finance.ethereumAddress()),
      transactionHash: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      params: {
        uri: faker.internet.url(),
        claimID: faker.number.bigInt(),
        totalUnits: faker.number.bigInt(),
      },
    };

    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json({ result: event });
      }),
    );

    const [claim] = await parseClaimStoredEvent({ event, context });

    expect(claim).toEqual({
      contracts_id: context.contracts_id,
      creator_address: from,
      owner_address: "0x0000000000000000000000000000000000000000",
      uri: event.params.uri,
      units: event.params.totalUnits,
      token_id: event.params.claimID,
    });
  });

  it("throws when the event is shaped incorrectly", async () => {
    const wrongArgs = generateClaimStoredEvent();
    // @ts-expect-error - wrong args
    wrongArgs.args = "wrong";

    await expect(
      async () => await parseClaimStoredEvent(wrongArgs),
    ).rejects.toThrowError();
  });

  it("throws when the event address is invalid", {}, async () => {
    const mockEvent = generateClaimStoredEvent({ address: "0xinvalid" });

    await expect(
      async () => await parseClaimStoredEvent({ log: mockEvent, context }),
    ).rejects.toThrowError();
  });
});
