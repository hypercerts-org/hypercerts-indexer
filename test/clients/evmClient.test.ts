import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnifiedRpcClientFactory } from "../../src/clients/rpcClientFactory.js";
vi.mock("@/utils/constants", () => ({
  environment: "test",
  alchemyApiKey: "mock-alchemy-key",
  infuraApiKey: "mock-infura-key",
  drpcApiPkey: "mock-drpc-key",
  filecoinApiKey: "mock-filecoin-key",
  Environment: { TEST: "test", PROD: "prod" },
}));

vi.mock("@/clients/rpcClientFactory", () => ({
  UnifiedRpcClientFactory: {
    createViemClient: vi.fn().mockReturnValue({ mock: "client" }),
  },
}));

vi.mock("./chainFactory", () => ({
  ChainFactory: {
    getChain: vi.fn(),
  },
}));

vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  http: vi.fn((url, options) => ({ url, ...options })),
  fallback: vi.fn((transports) => transports),
}));

import {
  EvmClientFactory,
  getRpcUrl,
  getSupportedChains,
} from "../../src/clients/evmClient.js";

describe("EvmClient", () => {
  describe("EvmClientFactory", () => {
    describe("getFirstAvailableUrl", () => {
      it("should return first available URL for supported chain", () => {
        const sepoliaUrl = EvmClientFactory.getFirstAvailableUrl(11155111);
        console.log(sepoliaUrl);
        expect(sepoliaUrl).toContain("alchemy.com");
        expect(sepoliaUrl).toContain("mock-alchemy-key");

        const celoUrl = EvmClientFactory.getFirstAvailableUrl(42220);
        console.log(celoUrl);
        expect(celoUrl).toContain("infura.io");
        expect(celoUrl).toContain("mock-infura-key"); 
      });

      it("should return undefined for unsupported chain", () => {
        const url = EvmClientFactory.getFirstAvailableUrl(999999);
        expect(url).toBeUndefined();
      });
    });

    describe("createClient", () => {
      it("should create client for supported chain", () => {
        const client = EvmClientFactory.createClient(11155111);
        expect(client).toBeDefined();
        expect(
          vi.mocked(UnifiedRpcClientFactory.createViemClient),
        ).toHaveBeenCalledWith(
          11155111,
          expect.stringContaining("alchemy.com"),
        );
      });

      it("should throw error for unsupported chain", () => {
        expect(() => EvmClientFactory.createClient(999999)).toThrow(
          "No RPC URL available for chain 999999",
        );
      });
    });
  });

  describe("getRpcUrl", () => {
    it("should return URL for supported chain", () => {
      const url = getRpcUrl(11155111);
      expect(url).toContain("alchemy.com");
      expect(url).toContain("mock-alchemy-key");
    });

    it("should throw error for unsupported chain", () => {
      expect(() => getRpcUrl(999999)).toThrow(
        "No RPC URL available for chain 999999",
      );
    });
  });
});

describe("EvmClientFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createClient", () => {
    it("should create a client with correct configuration", () => {
      EvmClientFactory.createClient(11155111); // Sepolia testnet

      expect(vi.mocked(UnifiedRpcClientFactory.createViemClient)).toHaveBeenCalledWith(
          11155111,
          expect.stringContaining("alchemy.com"),
        );
    });

    it("should throw error for unsupported chain", () => {
      const invalidChainId = 999999;
      expect(() => EvmClientFactory.createClient(invalidChainId)).toThrow(
        `No RPC URL available for chain ${invalidChainId}`,
      );
    });
  });

  describe("getSupportedChains", () => {
    it("should return test chains in test environment", () => {
      const chains = getSupportedChains();
      const expected = [11155111, 84532, 421614, 314159];
      expect(chains).toEqual(expect.arrayContaining(expected));
      expect(chains).toHaveLength(expected.length);
    });
  });
});

describe("RPC Providers", () => {
  describe("getRpcUrl", () => {
    it("should return Alchemy URL for supported chains", () => {
      const url = getRpcUrl(11155111); // Sepolia
      expect(url).toContain("alchemy.com");
      expect(url).toContain("alchemy-key");
    });

    it("should return Infura URL when Alchemy is not available", () => {
      const url = getRpcUrl(42220); // Celo
      expect(url).toContain("infura.io");
      expect(url).toContain("infura-key");
    });

    it("should return Glif URL for Filecoin", () => {
      const url = getRpcUrl(314159);
      expect(url).toContain("glif.io");
    });

    it("should throw error for unsupported chain", () => {
      expect(() => getRpcUrl(999999)).toThrow(
        "No RPC URL available for chain 999999",
      );
    });
  });
});
