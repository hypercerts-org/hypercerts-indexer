import { afterAll, afterEach, describe, it } from "vitest";
import { client } from "@/clients/evmClient";
import sinon from "sinon";
import { getBlocksToFetch } from "../../src/utils/getBlocksToFetch";

describe("getBlocksToFetch", () => {
  const readSpy = sinon.stub(client, "getBlockNumber");

  const defaultInput = {
    contractCreationBlock: 420n,
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
    expect(result).toEqual({ fromBlock: 1337n, toBlock: 1437n });
  });

  it("returns correct block range when fromBlock is less than contractCreationBlock", async ({
    expect,
  }) => {
    readSpy.resolves(1500n);
    const input = { ...defaultInput, fromBlock: 400n };
    const result = await getBlocksToFetch(input);
    expect(result).toEqual({ fromBlock: 420n, toBlock: 520n });
  });

  it("returns correct block range when batchSize is greater than remaining blocks", async ({
    expect,
  }) => {
    readSpy.resolves(1400n);
    const result = await getBlocksToFetch(defaultInput);
    expect(result).toEqual({ fromBlock: 1337n, toBlock: 1400n });
  });

  it("throws when fromBlock is more recent than toBlock", async ({
    expect,
  }) => {
    readSpy.resolves(1300n);
    await expect(() => getBlocksToFetch(defaultInput)).rejects.toThrowError(
      "[getBlocksToFetch] from block more recent than to block. [1337, 1300]",
    );
  });
});
