import { describe, it, expect } from "vitest";
import { server } from "../setup-env.js";
import { http, HttpResponse } from "msw";
import { chainId, supabaseUrl } from "../../src/utils/constants.js";
import { mockAllowListData } from "../resources/mockAllowListData.js";
import { storeAllowListData } from "../../src/storage/storeAllowListData.js";
import { Block } from "chainsauce";
import { faker } from "@faker-js/faker";

describe("storeAllowListData", async () => {
  server.use(
    http.post(`${supabaseUrl}/*`, async (data) => {
      const body = (await data.request.json()) || [];
      if (Array.isArray(body)) {
        if (body.length === 1) {
          return HttpResponse.json([mockAllowListData]);
        }
      }
    }),
  );

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
  };

  it("stores allow list data in DB", {}, async () => {
    const response = await storeAllowListData({
      data: [mockAllowListData],
      context,
    });

    expect(response).toEqual(undefined);
  });

  it("throws on duplicate roots", async () => {
    await storeAllowListData({
      data: [mockAllowListData, mockAllowListData],
      context,
    });
  });
});
