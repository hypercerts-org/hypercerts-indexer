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
  it("store hypercert data  in DB", {}, async () => {
    server.use(
      http.post(`${supabaseUrl}/*`, () => {
        return HttpResponse.json([mockMetadata]);
      }),
    );
    const claim: NewClaim = {
      contract_id: default_contractAddress,
      // contractAddress: default_contractAddress as `0x${string}`,
      // claimID: 1n,
      uri: "ipfs://metadataCIDstoreHypercert",
      // metadata: mockMetadata,
      contract_address: default_contractAddress,
      creator_address: faker.finance.ethereumAddress(),
      token_id: 1n,
      units: 1n,
      block_timestamp: 1n,
    };

    const storedClaim = await storeClaim({
      claims: [claim],
    });

    expect(storedClaim).toBeUndefined();

    // expect(storedClaim?.contract_address).toEqual(default_contractAddress);
  });

  it("should throw an error if creator address is invalid", async () => {
    const claim = {
      contract_address: default_contractAddress,
      creator_address: "invalid address",
      token_id: 1n,
      units: 1n,
      block_timestamp: 1n,
    } as unknown as NewClaim;

    expect(async () => {
      await storeClaim({
        claims: [claim],
      });
    }).rejects.toThrowError();
  });
});
