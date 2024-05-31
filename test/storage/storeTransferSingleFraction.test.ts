import { describe, it, expect, beforeEach } from "vitest";
import { storeTransferSingleFraction } from "../../src/storage/storeTransferSingleFraction";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";
import { getAddress } from "viem";

describe("storeTransferSingleFraction", () => {
  const transfer = {
    block_number: faker.number.bigInt(),
    contract_address: faker.finance.ethereumAddress(),
    value: faker.number.bigInt(),
    block_timestamp: faker.number.bigInt(),
    from_owner_address: getAddress(faker.finance.ethereumAddress()),
    to_owner_address: getAddress(faker.finance.ethereumAddress()),
    token_id: 420n,
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
});
