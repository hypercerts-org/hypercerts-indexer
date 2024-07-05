import { describe, expect, it, vi } from "vitest";
import { parseClaimStoredEvent } from "@/parsing/claimStoredEvent.js";
import { faker } from "@faker-js/faker";
import { client } from "@/clients/evmClient.js";
import { getAddress, GetTransactionReturnType } from "viem";
import { generateClaimStoredEvent } from "../helpers/factories.js";
import { Block } from "chainsauce";
import { chainId } from "../../src/utils/constants.js";

vi.mock("../../src/utils/getBlockTimestamp.js");

describe("claimStoredEvent", {}, () => {
  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
  };

  it("parses a claim stored event", {}, async () => {
    const mockEvent = generateClaimStoredEvent();

    const from = getAddress(faker.finance.ethereumAddress());
    const owner = getAddress(faker.finance.ethereumAddress());

    vi.spyOn(client, "getTransaction").mockResolvedValue({
      from,
    } as GetTransactionReturnType);

    vi.spyOn(client, "readContract").mockResolvedValue(owner);

    const parsed = await parseClaimStoredEvent({ log: mockEvent, context });

    expect(parsed[0]).toEqual({
      creator_address: from,
      owner_address: "0x0000000000000000000000000000000000000000",
      uri: mockEvent.params.uri,
      units: mockEvent.params.totalUnits,
      token_id: mockEvent.params.claimID,
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
