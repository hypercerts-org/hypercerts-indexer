import { describe, expect, it } from "vitest";
import { default_contractAddress } from "../handlers";
import { mockMetadata } from "../resources/mockMetadata";
import { storeClaim } from "../../src/storage/storeClaim";
import { NewClaim } from "../../src/types/types";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { supabaseUrl } from "../../src/utils/constants";

describe("storeHypercert", {}, async () => {
  const claim: NewClaim = {
    contracts_id: faker.string.uuid(),
    uri: "ipfs://metadataCIDstoreHypercert",
    contract_address: default_contractAddress,
    creator_address: faker.finance.ethereumAddress(),
    token_id: 1n,
    units: 1n,
    block_timestamp: 1n,
  };

  it("store hypercert data  in DB", {}, async () => {
    server.use(
      http.post(`${supabaseUrl}/*`, () => {
        return HttpResponse.json([mockMetadata]);
      }),
    );

    const storedClaim = await storeClaim({
      claims: [claim],
    });

    expect(storedClaim).toBeUndefined();
  });

  it("should throw an error if creator address is invalid", async () => {
    const claimWithWrongAddress = {
      ...claim,
      creator_address: "invalid address",
    } as unknown as NewClaim;

    await expect(
      async () =>
        await storeClaim({
          claims: [claimWithWrongAddress],
        }),
    ).rejects.toThrowError("[StoreClaim] Invalid creator address");
  });
});
