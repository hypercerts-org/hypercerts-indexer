import { describe, expect, it } from "vitest";
import { parseClaimStoredEvent } from "../../src/parsing";
import { faker } from "@faker-js/faker";

describe("claimStoredEvent", {}, () => {
  it("parses a claim stored event", {}, () => {
    const address = faker.finance.ethereumAddress() as `0x${string}`;
    const uri = faker.internet.url();
    const claimID = faker.number.bigInt();
    const event = {
      event: "ClaimStored",
      address,
      args: {
        uri,
        claimID,
      },
    };

    const parsed = parseClaimStoredEvent(event);

    console.log(parsed);
    expect(parsed).toEqual({
      contractAddress: address,
      uri,
      claimID,
    });
  });

  it("returns undefined when the event is missing claimID or URI", {}, () => {
    const address = faker.finance.ethereumAddress();
    const event = {
      id: "0x3e7d7e4c4f3d5a7f2b3d6c5",
      event: "ClaimStored",
      address,
      args: {
        uri: "https://example.com/claim",
      },
    };

    const parsed = parseClaimStoredEvent(event);

    expect(parsed).toBe(undefined);
  });

  it("returns undefined when the event address is invalid", {}, () => {
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

    const parsed = parseClaimStoredEvent(event);

    expect(parsed).toBe(undefined);
  });
});
