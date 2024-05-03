import { describe, expect, it } from "vitest";

import { fetchMetadataFromUri } from "@/fetching/fetchMetadataFromUri";
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
    expect(response?.image).toEqual(mockMetadata.image);
    expect(response?.name).toEqual(mockMetadata.name);
    expect(response?.description).toEqual(mockMetadata.description);
    expect(response?.properties).toEqual(mockMetadata.properties);
    expect(response?.external_url).toEqual(mockMetadata.external_url);
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
    expect(response?.image).toEqual(mockMetadata.image);
    expect(response?.name).toEqual(mockMetadata.name);
    expect(response?.description).toEqual(mockMetadata.description);
    expect(response?.properties).toEqual(mockMetadata.properties);
    expect(response?.external_url).toEqual(mockMetadata.external_url);
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
    expect(response?.image).toEqual(mockMetadata.image);
    expect(response?.name).toEqual(mockMetadata.name);
    expect(response?.description).toEqual(mockMetadata.description);
    expect(response?.properties).toEqual(mockMetadata.properties);
    expect(response?.external_url).toEqual(mockMetadata.external_url);
  });

  it("should return undefined if no metadata is found", async () => {
    server.use(
      http.get(`https://*.ipfs.*.link`, () => {
        return HttpResponse.json({ data: "not metadata" });
      }),
    );

    const claim = {
      contractAddress: faker.finance.ethereumAddress() as `0x${string}`,
      claimID: 1n,
      uri: "ipfs://metadataCID",
    };

    const response = await fetchMetadataFromUri(claim);

    expect(response).toBeUndefined();
  });
});
