import { describe, expect, it, vi } from "vitest";
import { parseClaimStoredEvent } from "../../src/parsing";
import { faker } from "@faker-js/faker";
import { client } from "../../src/clients/evmClient";
import { getAddress, GetTransactionReturnType } from "viem";
import { generateClaimStoredEvent } from "../helpers/factories";

describe("claimStoredEvent", {}, () => {
  it("parses a claim stored event", {}, async () => {
    const mockEvent = generateClaimStoredEvent();

    const from = getAddress(faker.finance.ethereumAddress());
    const owner = getAddress(faker.finance.ethereumAddress());

    vi.spyOn(client, "getTransaction").mockResolvedValue({
      from,
    } as GetTransactionReturnType);

    vi.spyOn(client, "readContract").mockResolvedValue(owner);

    const parsed = await parseClaimStoredEvent(mockEvent);

    expect(parsed).toEqual({
      creator_address: from,
      owner_address: "0x0000000000000000000000000000000000000000",
      uri: mockEvent.args.uri,
      units: mockEvent.args.totalUnits,
      block_number: mockEvent.blockNumber,
      token_id: mockEvent.args.claimID,
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
      async () => await parseClaimStoredEvent(mockEvent),
    ).rejects.toThrowError();
  });
});
