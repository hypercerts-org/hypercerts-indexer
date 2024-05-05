import { describe, expect, it } from "vitest";
import { default_blockNumber } from "../handlers";
import { updateLastBlockIndexedContractEvents } from "../../src/storage/updateLastBlockIndexedContractEvents";
import { server } from "../setup-env";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants";

describe("updateLastBlockIndexed", {}, async () => {
  it("update the last block indexed in DB", {}, async () => {
    server.use(
      http.patch(`${supabaseUrl}/*`, () => {
        HttpResponse.json();
      }),
    );
    const lastBlockIndexed = await updateLastBlockIndexedContractEvents({
      contract_events: [
        {
          id: "a",
          last_block_indexed: default_blockNumber,
        },
      ],
    });

    expect(lastBlockIndexed).toBeUndefined();
    //
    // if (!lastBlockIndexed) {
    //   throw new Error("lastBlockIndexed is undefined");
    // }
    //
    // expect(lastBlockIndexed).toBeDefined();
    // expect(lastBlockIndexed.length).toEqual(1);
    //
    // const lastBlockIndexedData = lastBlockIndexed[0];
    //
    // expect(lastBlockIndexedData.block_number).toEqual(default_blockNumber);
    // expect(lastBlockIndexedData.chain_id).toEqual(default_chainID);
    // expect(lastBlockIndexedData.contract_address).toEqual(
    //   default_contractAddress,
    // );
  });
});
