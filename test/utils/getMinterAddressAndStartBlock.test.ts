import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { getMinterAddressAndStartBlock } from "../../src/utils/getMinterAddressAndStartBlock";
import { getAddress } from "viem";
import { faker } from "@faker-js/faker";

const mocks = vi.hoisted(() => {
  return {
    getDeployment: vi.fn(),
  };
});

vi.mock("../../src/utils/getDeployment", () => ({
  getDeployment: mocks.getDeployment,
}));

describe("getMinterAddressAndStartBlock", () => {
  const minterAddress = getAddress(faker.finance.ethereumAddress());
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("returns minter address and startblock for supported chain ID", () => {
    mocks.getDeployment.mockReturnValue({
      addresses: { HypercertMinterUUPS: minterAddress },
      startBlock: 12345n,
    });

    const res = getMinterAddressAndStartBlock();

    expect(res.address).toEqual(minterAddress);
    expect(res.startBlock).toEqual(12345n);
  });

  it("throws error when address not found", () => {
    mocks.getDeployment.mockReturnValue({
      addresses: { HypercertMinterUUPS: null },
      startBlock: 12345n,
    });

    expect(() => getMinterAddressAndStartBlock()).toThrowError(
      "[getMinterAddressAndStartBlock] HypercertMinterUUPS is not available",
    );
  });

  it("throws error when address is not valid", () => {
    mocks.getDeployment.mockReturnValue({
      addresses: { HypercertMinterUUPS: "not an address" },
      startBlock: 12345n,
    });

    expect(() => getMinterAddressAndStartBlock()).toThrowError(
      "[getMinterAddressAndStartBlock] HypercertMinterUUPS is not available",
    );
  });
});
