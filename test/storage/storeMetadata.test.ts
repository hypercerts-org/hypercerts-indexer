import { beforeEach, describe, expect, it } from "vitest";
import { storeMetadata } from "../../src/storage/storeMetadata";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";

describe("storeMetadata", () => {
  const mockMetadata = {
    allow_list_uri: "https://example.com",
    contributors: ["John Doe"],
    description: "This is a description",
    external_url: "https://example.com/hypercert/1",
    image: "data:image/png;base64,iVBOA...uQmCC",
    impact_scope: ["Global"],
    impact_timeframe_from: 2022,
    impact_timeframe_to: 2023,
    name: "My Hypercert",
    properties: [
      {
        trait_type: "trait",
        value: "value",
      },
    ],
    rights: ["All rights reserved"],
    uri: "QmXZj9Pm4g7Hv3Z6K4Vw2vW",
    work_scope: ["Global"],
    work_timeframe_from: 2022,
    work_timeframe_to: 2023,
  };
  beforeEach(() => {
    server.use(
      http.post(`${supabaseUrl}/*`, async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json(data);
      }),
    );
  });
  it("should store metadata", async () => {
    await storeMetadata({
      metadata: [mockMetadata],
    });
  });

  it("should fail if work timeframe is in wrong chronological order", async () => {
    const metadata = {
      ...mockMetadata,
      work_timeframe_to: mockMetadata.work_timeframe_from - 1,
    };

    // Spy on storemetadata to check if it throws
    await expect(async () => {
      await storeMetadata({
        metadata: [metadata],
      });
    }).rejects.toThrowError(
      "work_timeframe_from must be less than work_timeframe_to",
    );
  });

  it("should fail if impact timeframe is in wrong chronological order", async () => {
    const metadata = {
      ...mockMetadata,
      impact_timeframe_to: mockMetadata.impact_timeframe_from - 1,
    };

    // Spy on storemetadata to check if it throws
    await expect(async () => {
      await storeMetadata({
        metadata: [metadata],
      });
    }).rejects.toThrowError(
      "impact_timeframe_from must be less than impact_timeframe_to",
    );
  });
});
