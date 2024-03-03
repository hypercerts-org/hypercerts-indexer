import { describe, expect, it } from "vitest";
import {
  getLastBlockIndexed,
  LastBlockIndexedParams,
} from "@/storage/getLastBlockIndexed";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";

describe("getLastBlockIndexed", {}, () => {
  it("returns the last block indexed", {}, async () => {
    server.use(
      http.get(`${supabaseUrl}/rest/v1/lastblockindexed`, () => {
        return HttpResponse.json([
          {
            block_number: 123456,
          },
        ]);
      }),
    );

    const lastBlockIndexed = await getLastBlockIndexed();

    expect(lastBlockIndexed).toBeDefined();
    expect(lastBlockIndexed?.blockNumber).toEqual(123456);
  });

  it("returns undefined if chain ID is invalid", {}, async () => {
    const invalidParams = {
      chainId: "HELLO",
      contractAddress: "0x1234...5678",
    };
    const lastBlockIndexed = await getLastBlockIndexed(
      invalidParams as unknown as LastBlockIndexedParams,
    );

    expect(lastBlockIndexed).toBeUndefined();
  });

  it("returns undefined if contract address is invalid", {}, async () => {
    const invalidParams = {
      chainId: 1,
      contractAddress: "HELLO",
    };
    const lastBlockIndexed = await getLastBlockIndexed(
      invalidParams as unkown as LastBlockIndexedPa,
    );

    expect(lastBlockIndexed).toBeUndefined();
  });

  it("returns undefined if no data was returned", {}, async () => {
    server.use(
      http.get(
        `${supabaseUrl}/rest/v1/lastblockindexed`,
        () => {
          return new Response(JSON.stringify([]));
        },
        { once: true },
      ),
    );

    const lastBlockIndexed = await getLastBlockIndexed();

    expect(lastBlockIndexed).toBeUndefined();
  });

  it("returns undefined if no block number is found", {}, async () => {
    server.use(
      http.get(
        `${supabaseUrl}/rest/v1/lastblockindexed`,
        () => {
          return new Response(
            JSON.stringify([
              {
                notBlockNumber: 1,
              },
            ]),
          );
        },
        { once: true },
      ),
    );

    const lastBlockIndexed = await getLastBlockIndexed();

    expect(lastBlockIndexed).toBeUndefined();
  });
});
