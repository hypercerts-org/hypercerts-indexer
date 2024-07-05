import { describe, it, expect, beforeEach, vi } from "vitest";
import { storeTransferSingle } from "../../src/storage/storeTransferSingle.js";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env.js";
import { http, HttpResponse } from "msw";
import { chainId, supabaseUrl } from "../../src/utils/constants.js";
import { getAddress } from "viem";
import { Block } from "chainsauce";
import { supabase } from "../../src/clients/supabaseClient";

describe("storeTransferSingleFraction", () => {
  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64),
    timestamp: faker.number.bigInt(),
  };

  const context = {
    block,
  };

  const transfer = {
    contract_address: faker.finance.ethereumAddress().toString(),
    value: faker.number.bigInt(),
    from_owner_address: getAddress(faker.finance.ethereumAddress()),
    to_owner_address: getAddress(faker.finance.ethereumAddress()),
    token_id: 420n,
    contracts_id: faker.string.uuid(),
    type: "fraction",
  } as const;

  beforeEach(() => {
    server.use(
      http.get(`${supabaseUrl}/*`, async () => {
        return HttpResponse.json({
          id: faker.string.uuid(),
          claims_id: faker.string.uuid(),
          token_id: transfer.token_id.toString(),
        });
      }),
      http.post(`${supabaseUrl}/*`, async () => {
        return HttpResponse.json({
          id: faker.string.uuid(),
          claims_id: faker.string.uuid(),
          token_id: transfer.token_id.toString(),
        });
      }),
    );
  });

  it("should store the fraction tokens", async () => {
    const spy = vi.spyOn(supabase, "from");
    await storeTransferSingle({
      data: [transfer],
      context,
    });

    // 2 calls: get fraction and post new fraction
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it.skip("should only store the entry for a token with newest timestamp", async () => {
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
      last_update_block_number: transfer.last_update_block_number - 1n,
      last_update_block_timestamp: transfer.last_update_block_timestamp - 10n,
      value: transfer.value - 1n,
    };

    await storeTransferSingle({
      data: [transferOld, transfer],
      context,
    });

    if (!theResult) {
      expect.fail("result undefined");
    }

    expect(theResult.length).toBe(1);
    expect(theResult[0].value).toBe(transfer.value.toString());

    await storeTransferSingle({
      data: [transfer, transferOld],
      context,
    });
    if (!theResult) {
      expect.fail("resultReversed undefined");
    }

    expect(theResult.length).toBe(1);
    expect(theResult[0].value).toBe(transfer.value.toString());
  });
});
