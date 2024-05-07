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
    type: "claim",
    block_timestamp: faker.number.bigInt(),
    owner_address: faker.finance.ethereumAddress(),
    token_id: faker.number.bigInt(),
    contracts_id: faker.string.uuid(),
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
    const transferOld = {
      ...transfer,
      block_timestamp: transfer.block_timestamp - 1n,
      value: transfer.value - 1n,
    };

    const result = await storeTransferSingleFraction({
      transfers: [transferOld, transfer],
    });
    console.log(result);
    if (!result?.data) {
      expect.fail("result undefined");
    }

    expect(result.data.length).toBe(1);
    expect(result.data[0].value).toBe(transfer.value.toString());

    const resultReversed = await storeTransferSingleFraction({
      transfers: [transfer, transferOld],
    });
    console.log(resultReversed);
    if (!resultReversed?.data) {
      expect.fail("resultReversed undefined");
    }

    expect(resultReversed.data.length).toBe(1);
    expect(resultReversed.data[0].value).toBe(transfer.value.toString());
  });
});
