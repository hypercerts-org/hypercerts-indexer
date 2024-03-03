import { describe, expect, it } from "vitest";

import { fetchMetadataFromUri } from "@/fetching";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { mockMetadata } from "../resources/mockMetadata";
import { faker } from "@faker-js/faker";

describe("Fetch metadata from URI", () => {
  it("should fetch and add metadata from IPFS", async () => {
    server.use(
      http.get(`https://*.ipfs.*.link`, () => {
        return HttpResponse.json(mockMetadata);
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: "ipfs://metadataCID",
    };

    const response = await fetchMetadataFromUri(claim);

    expect(response).toBeDefined();
    expect(response?.metadata).toBeDefined();
    expect(response?.metadata).toEqual(mockMetadata);
    expect(response?.claimID).toEqual(claim.claimID);
    expect(response?.contractAddress).toEqual(claim.contractAddress);
    expect(response?.uri).toEqual(claim.uri);
  });

  it("should fetch metadata from HTTPS", async () => {
    server.use(
      http.get(`https://example.com`, () => {
        return HttpResponse.json(mockMetadata);
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: "https://example.com",
    };

    const response = await fetchMetadataFromUri(claim);

    expect(response).toBeDefined();
    expect(response.metadata).toBeDefined();
    expect(response.metadata).toEqual(mockMetadata);
    expect(response.claimID).toEqual(claim.claimID);
    expect(response.contractAddress).toEqual(claim.contractAddress);
    expect(response.uri).toEqual(claim.uri);
  });

  it("should fetch metadata with only CID", async () => {
    server.use(
      http.get(`https://*.ipfs.*.link`, () => {
        return HttpResponse.json(mockMetadata);
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: "QmXZj9Pm4g7Hv3Z6K4Vw2vW",
    };

    const response = await fetchMetadataFromUri(claim);

    expect(response).toBeDefined();
    expect(response.metadata).toBeDefined();
    expect(response.metadata).toEqual(mockMetadata);
    expect(response.claimID).toEqual(claim.claimID);
    expect(response.contractAddress).toEqual(claim.contractAddress);
    expect(response.uri).toEqual(claim.uri);
  });

  it("should return undefined if no metadata is found", async () => {
    server.use(
      http.get(`ipfs.*.link`, () => {
        return HttpResponse.json({ data: "not metadata" });
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: "ipfs://metadataCID",
    };

    const response = await fetchMetadataFromUri(claim);

    expect(response).toBeDefined();
    expect(response.metadata).toBeUndefined();
    expect(response.claimID).toEqual(claim.claimID);
    expect(response.contractAddress).toEqual(claim.contractAddress);
    expect(response.uri).toEqual(claim.uri);
  });
});
