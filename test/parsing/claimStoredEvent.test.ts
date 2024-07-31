import { describe, expect, it, vi } from "vitest";
import { parseClaimStoredEvent } from "../../src/parsing/parseClaimStoredEvent.js";
import { faker } from "@faker-js/faker";
import { client } from "@/clients/evmClient.js";
import { getAddress, GetTransactionReturnType } from "viem";
import { generateClaimStoredEvent } from "../helpers/factories.js";
import { Block } from "@hypercerts-org/chainsauce";
import { chainId } from "../../src/utils/constants.js";

describe("claimStoredEvent", {}, () => {
  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    event_name: "ClaimStored",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  it("parses a claim stored event", {}, async () => {
    const event = generateClaimStoredEvent();

    const from = getAddress(faker.finance.ethereumAddress());
    const owner = getAddress(faker.finance.ethereumAddress());

    vi.spyOn(client, "getTransaction").mockResolvedValue({
      from,
    } as GetTransactionReturnType);

    vi.spyOn(client, "readContract").mockResolvedValue(owner);

    const parsed = await parseClaimStoredEvent({ event, context });

    expect(parsed[0]).toEqual({
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
