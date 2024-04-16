import { describe, expect, it } from "vitest";
import {
  default_blockNumber,
  default_chainID,
  default_contractAddress,
} from "../handlers";

describe("updateLastBlockIndexed", {}, async () => {
  it("update the last block indexed in DB", {}, async () => {
    const lastBlockIndexed = await updateLastBlockIndexed(
      BigInt(default_blockNumber),
    );

    if (!lastBlockIndexed) {
      throw new Error("lastBlockIndexed is undefined");
    }

    expect(lastBlockIndexed).toBeDefined();
    expect(lastBlockIndexed.length).toEqual(1);

    const lastBlockIndexedData = lastBlockIndexed[0];

    expect(lastBlockIndexedData.block_number).toEqual(default_blockNumber);
    expect(lastBlockIndexedData.chain_id).toEqual(default_chainID);
    expect(lastBlockIndexedData.contract_address).toEqual(
      default_contractAddress,
    );
  });
});
