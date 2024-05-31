import { describe, it, expect } from "vitest";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { supabaseUrl } from "../../src/utils/constants";
import { Tables } from "../../src/types/database.types";
import { getSupportedSchemas } from "../../src/storage/getSupportedSchemas";
import { getAddress } from "viem";

describe("getSupportedSchemas", {}, async () => {
  const mockSupportedSchema: Tables<"supported_schemas"> = {
    uid: "",
    resolver: getAddress(faker.finance.ethereumAddress()),
    revocable: false,
    chain_id: 11155111,
    id: faker.string.uuid(),
    schema: faker.string.hexadecimal({ length: 32 }),
    last_block_indexed: 1,
  };

  it("get schema from DB", {}, async () => {
    server.use(
      http.get(`${supabaseUrl}/*`, () => {
        return HttpResponse.json([mockSupportedSchema]);
      }),
    );

    const supportedSchema = await getSupportedSchemas();

    expect(supportedSchema).toBeDefined();
    expect(supportedSchema![0]).toEqual(mockSupportedSchema);
  });

  it("should throw an error if the supabase call errors out", async () => {
    server.use(
      http.get(`${supabaseUrl}/*`, () => {
        return HttpResponse.error();
      }),
    );

    await expect(
      async () => await getSupportedSchemas(),
    ).rejects.toThrowError();
  });
});
