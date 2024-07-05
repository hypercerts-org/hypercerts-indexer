import { describe, expect, it } from "vitest";
import { storeClaimStored } from "../../src/storage/storeClaimStored.js";
import { server } from "../setup-env.js";
import { http, HttpResponse } from "msw";
import { chainId, supabaseUrl } from "../../src/utils/constants.js";
import { generateClaim } from "../helpers/factories.js";
import { Block } from "chainsauce";
import { faker } from "@faker-js/faker";

describe("storeHypercert", {}, async () => {
  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
  };

  const claim = generateClaim();

  it("store hypercert data  in DB", {}, async () => {
    server.use(
      http.post(`${supabaseUrl}/*`, () => {
        return HttpResponse.json();
      }),
    );

    const storedClaim = await storeClaimStored({
      data: [claim],
      context,
    });

    expect(storedClaim).toBeUndefined();
  });

  it("should throw an error if creator address is invalid", async () => {
    const wrongAddress = {
      ...claim,
      creator_address: "0xWRONGADDRESS" as `0x${string}`,
    };

    await expect(
      async () =>
        await storeClaimStored({
          data: [wrongAddress],
          context,
        }),
    ).rejects.toThrowError();
  });
});
