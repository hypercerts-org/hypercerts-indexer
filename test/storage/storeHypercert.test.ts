import { describe, expect, it } from "vitest";
import { storeClaim } from "../../src/storage/storeClaimStored";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";
import { generateClaim } from "../helpers/factories";

describe("storeHypercert", {}, async () => {
  const claim = generateClaim();

  it("store hypercert data  in DB", {}, async () => {
    server.use(
      http.post(`${supabaseUrl}/*`, () => {
        return HttpResponse.json();
      }),
    );

    const storedClaim = await storeClaim({
      claims: [claim],
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
        await storeClaim({
          claims: [wrongAddress],
        }),
    ).rejects.toThrowError();
  });
});
