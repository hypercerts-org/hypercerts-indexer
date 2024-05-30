import { describe, expect, it } from "vitest";
import { parseAllowListCreated } from "../../src/parsing/allowListCreatedEvent";
import { faker } from "@faker-js/faker";

describe("allowlistCreatedEvent", () => {
  const tokenID = faker.number.bigInt();
  const blockNumber = faker.number.bigInt();
  const root = "abcdef";
  const address = faker.finance.ethereumAddress() as `0x${string}`;

  const args = {
    tokenID,
    root,
  };

  const event = {
    address,
    blockNumber,
    args,
  };

  it("parses allowlistCreated event", async () => {
    const parsed = await parseAllowListCreated(event);

    if (!parsed) {
      expect(true).toBeFalsy();
      return;
    }

    expect(parsed.token_id).toEqual(tokenID);
    expect(parsed.root).toEqual(root);
  });

  it("fails silently  if event is invalid", async () => {
    const parsed1 = await parseAllowListCreated({
      ...event,
      blockNumber: "not a bigint",
    });
    expect(parsed1).toBeUndefined();

    const parsed2 = await parseAllowListCreated({
      ...event,
      address: "not an address",
    });
    expect(parsed2).toBeUndefined();
  });

  it("fails silently if event args are invalid", async () => {
    const parsed = await parseAllowListCreated({
      ...event,
      args: {
        ...event.args,
        root: 1,
      },
    });
    expect(parsed).toBeUndefined();

    const parsed2 = await parseAllowListCreated({
      ...event,
      args: {
        ...event.args,
        root: faker.number.bigInt(),
      },
    });
    expect(parsed2).toBeUndefined();
  });
});
