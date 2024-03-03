import { describe, expect, it } from "vitest";
import { storeHypercert } from "../../src/storage";
import { default_contractAddress } from "../handlers";
import { mockMetadata } from "../resources/mockMetadata";

describe("storeHypercert", {}, async () => {
  it("store hypercert data  in DB", {}, async () => {
    const claim = {
      contractAddress: default_contractAddress as `0x${string}`,
      claimID: 1n,
      uri: "ipfs://metadataCIDstoreHypercert",
      metadata: mockMetadata,
    };

    const storedClaim = await storeHypercert(claim);

    expect(storedClaim).toBeDefined();

    expect(storedClaim?.contract_address).toEqual(default_contractAddress);
  });
});
