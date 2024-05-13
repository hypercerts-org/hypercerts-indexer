import { describe, it, expect, beforeEach } from "vitest";
import { storeTransferSingleFraction } from "../../src/storage/storeTransferSingleFraction";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";

describe("storeTransferSingleFraction", () => {
  const transfer = {
    block_number: faker.number.bigInt(),
    contract_address: faker.finance.ethereumAddress(),
    value: faker.number.bigInt(),
    block_timestamp: faker.number.bigInt(),
    owner_address: faker.finance.ethereumAddress(),
    token_id: faker.number.bigInt(),
    contracts_id: faker.string.uuid(),
    type: "fraction",
  } as const;

  beforeEach(() => {
    server.use(
      http.post(`${supabaseUrl}/*`, async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json(data);
      }),
    );
  });

  it("should store the fraction tokens", async () => {
    const response = await storeTransferSingleFraction({
      transfers: [transfer],
    });

    if (!response) {
      expect.fail("response undefined");
    }
  });

  it("should only store the entry for a token with newest timestamp", async () => {
    let theResult: any[] = [];
    server.use(
      http.post(`${supabaseUrl}/*`, async ({ request }) => {
        const data = await request.json();
        // @ts-ignore
        theResult = data._fractions;
        return HttpResponse.json(data);
      }),
    );
    const transferOld = {
      ...transfer,
      block_timestamp: transfer.block_timestamp - 1n,
      value: transfer.value - 1n,
    };

    await storeTransferSingleFraction({
      transfers: [transferOld, transfer],
    });

    if (!theResult) {
      expect.fail("result undefined");
    }

    expect(theResult.length).toBe(1);
    expect(theResult[0].value).toBe(transfer.value.toString());

    await storeTransferSingleFraction({
      transfers: [transfer, transferOld],
    });
    if (!theResult) {
      expect.fail("resultReversed undefined");
    }

    expect(theResult.length).toBe(1);
    expect(theResult[0].value).toBe(transfer.value.toString());
  });
});
