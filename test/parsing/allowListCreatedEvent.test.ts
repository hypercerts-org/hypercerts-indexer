import { beforeEach, describe, expect, it } from "vitest";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { alchemyUrl } from "../../src/utils/constants";
import { parseAllowListCreated } from "../../src/parsing/allowListCreatedEvent";
import { faker } from "@faker-js/faker";
import { assignWith } from "lodash";

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

  beforeEach(() => {
    server.use(
      http.post(`${alchemyUrl}/*`, () => {
        return HttpResponse.json(0);
      }),
    );
  });

  it("parses allowlistCreated event", async () => {
    const parsed = await parseAllowListCreated(event);

    if (!parsed) {
      expect(true).toBeFalsy();
      return;
    }

    expect(parsed.token_id).toEqual(tokenID);
    expect(parsed.root).toEqual(root);
  });

  it("fails if event is invalid", async () => {
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

  it("fails if event args are invalid", async () => {
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
