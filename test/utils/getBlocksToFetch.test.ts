import { afterAll, afterEach, describe, it } from "vitest";
import { client } from "@/clients/evmClient.js";
import sinon from "sinon";
import { getBlocksToFetch } from "@/utils/getBlocksToFetch.js";

describe("getBlocksToFetch", () => {
  const readSpy = sinon.stub(client, "getBlockNumber");

  const defaultInput = {
    fromBlock: 1337n,
    batchSize: 100n,
  };
  afterEach(() => {
    sinon.reset();
  });

  afterAll(() => {
    sinon.restore();
  });

  it("throws when call for block fails", async ({ expect }) => {
    readSpy.throws();
    await expect(() => getBlocksToFetch(defaultInput)).rejects.toThrowError();
  });

  it("returns correct block range when fromBlock is greater than contractCreationBlock", async ({
    expect,
  }) => {
    readSpy.resolves(1500n);
    const result = await getBlocksToFetch(defaultInput);
    expect(result).toEqual({
      fromBlock: defaultInput.fromBlock,
      toBlock: 1437n,
    });
  });

  it("returns correct block range when batchSize is greater than remaining blocks", async ({
    expect,
  }) => {
    readSpy.resolves(1400n);
    const result = await getBlocksToFetch(defaultInput);
    expect(result).toEqual({
      fromBlock: defaultInput.fromBlock,
      toBlock: 1400n,
    });
  });

  it("returns undefined when fromBlock is greater to or equal to than toBlock", async ({
    expect,
  }) => {
    readSpy.resolves(1300n);
    const result = await getBlocksToFetch(defaultInput);
    expect(result).toBeUndefined();
  });
});
