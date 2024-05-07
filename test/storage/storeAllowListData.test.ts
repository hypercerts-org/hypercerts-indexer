import { describe, it, expect } from "vitest";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";
import { mockAllowListData } from "../resources/mockAllowListData";
import { storeAllowListData } from "../../src/storage/storeAllowListData";

describe("storeAllowListData", async () => {
  it("stores allow list data in DB", {}, async () => {
    server.use(
      http.post(`${supabaseUrl}/*`, () => {
        return HttpResponse.json([mockAllowListData]);
      }),
    );

    const response = await storeAllowListData({
      allowListData: [mockAllowListData],
    });

    expect(response).toEqual(undefined);
  });

  it("deduplicates by root", async () => {
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

    await storeAllowListData({
      allowListData: [mockAllowListData, mockAllowListData],
    });
  });
});
