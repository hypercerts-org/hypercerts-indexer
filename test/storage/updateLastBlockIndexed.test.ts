import { describe, expect, it } from "vitest";
import { updateLastBlockIndexed } from "../../src/storage";
import {
  default_blockNumber,
  default_chainID,
  default_contractAddress,
} from "../setup-env";

describe("updateLastBlockIndexed", {}, async () => {
  it("update the last block indexed in DB", {}, async () => {
    const lastBlockIndexed = await updateLastBlockIndexed(
      BigInt(default_blockNumber),
    );

    expect(lastBlockIndexed).toBeDefined();
    expect(lastBlockIndexed.length).toEqual(1);

    // @ts-expect-error - TS doesn't know that lastBlockIndexed is an array
    const lastBlockIndexedData = lastBlockIndexed[0];

    expect(lastBlockIndexedData.block_number).toEqual(default_blockNumber);
    expect(lastBlockIndexedData.chain_id).toEqual(default_chainID);
    expect(lastBlockIndexedData.contract_address).toEqual(
      default_contractAddress,
    );
  });
});
