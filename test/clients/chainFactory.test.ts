import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/constants", () => ({
  environment: "test",
  Environment: {
    TEST: "test",
    PROD: "prod",
  },
}));

import {
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    celo,
    filecoin,
    filecoinCalibration,
    optimism,
    sepolia,
} from "viem/chains";
import { ChainFactory } from "../../src/clients/chainFactory.js";

describe("ChainFactory", () => {
  describe("getChain", () => {
    it("returns the correct chain for valid chain IDs", () => {
      const testCases = [
        { chainId: 10, expected: optimism },
        { chainId: 314, expected: filecoin },
        { chainId: 8453, expected: base },
        { chainId: 42161, expected: arbitrum },
        { chainId: 42220, expected: celo },
        { chainId: 84532, expected: baseSepolia },
        { chainId: 314159, expected: filecoinCalibration },
        { chainId: 421614, expected: arbitrumSepolia },
        { chainId: 11155111, expected: sepolia },
      ];

      testCases.forEach(({ chainId, expected }) => {
        expect(ChainFactory.getChain(chainId)).toEqual(expected);
      });
    });

    it("throws error for invalid chain ID", () => {
      expect(() => ChainFactory.getChain(999999)).toThrow(
        "Unsupported chain ID: 999999",
      );
    });
  });

  describe("getSupportedChains", () => {
    describe("when in test environment", () => {
      it("returns test chains", () => {
        const expected = [11155111, 84532, 421614, 314159];
        expect(ChainFactory.getSupportedChains()).toEqual(
          expect.arrayContaining(expected),
        );
        expect(ChainFactory.getSupportedChains()).toHaveLength(expected.length);
      });
    });
  });
});
