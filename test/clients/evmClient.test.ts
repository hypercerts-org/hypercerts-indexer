import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnifiedRpcClientFactory } from "../../src/clients/rpcClientFactory.js";
import * as viem from "viem";

vi.mock("@/utils/constants", () => ({
  environment: "test",
  alchemyApiKey: "mock-alchemy-key",
  drpcApiPkey: "mock-drpc-key",
  filecoinApiKey: "mock-filecoin-key",
  Environment: { TEST: "test", PROD: "prod" },
}));

vi.mock("@/clients/rpcClientFactory", () => ({
  UnifiedRpcClientFactory: {
    createViemTransport: vi.fn().mockReturnValue({
      request: vi.fn(),
      retryCount: 3,
      timeout: 20_000,
    }),
  },
}));

vi.mock("./chainFactory", () => ({
  ChainFactory: {
    getChain: vi.fn(),
  },
}));

vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  fallback: vi.fn((transports) => transports),
  http: vi.fn((url) => ({ url })),
}));

import {
  EvmClientFactory,
  getRpcUrl,
  getSupportedChains,
} from "../../src/clients/evmClient.js";

describe("EvmClient", () => {
  describe("EvmClientFactory", () => {
    describe("getAllAvailableUrls", () => {
      it("returns all available URLs for supported chain", () => {
        const sepoliaUrls = EvmClientFactory.getAllAvailableUrls(11155111);
        expect(sepoliaUrls).toHaveLength(1); // Alchemy for Optimism
        expect(sepoliaUrls[0]).toContain("alchemy.com");

        const opUrls = EvmClientFactory.getAllAvailableUrls(10);
        expect(opUrls).toHaveLength(2); // Alchemy, DRPC for Optimism
        expect(opUrls[0]).toContain("alchemy.com");
        expect(opUrls[1]).toContain("drpc.org");
      });

      it("returns empty array for unsupported chain", () => {
        const urls = EvmClientFactory.getAllAvailableUrls(999999);
        expect(urls).toHaveLength(0);
      });
    });

    describe("createClient", () => {
      it("creates client with fallback transport for supported chain", () => {
        EvmClientFactory.createClient(10);

        expect(viem.createPublicClient).toHaveBeenCalledWith({
          chain: expect.any(Object),
          transport: expect.any(Array),
        });

        expect(
          vi.mocked(UnifiedRpcClientFactory.createViemTransport),
        ).toHaveBeenCalledWith(10, expect.stringContaining("alchemy.com"));
        expect(
          vi.mocked(UnifiedRpcClientFactory.createViemTransport),
        ).toHaveBeenCalledWith(10, expect.stringContaining("drpc.org"));
      });

      it("throws error for unsupported chain", () => {
        expect(() => EvmClientFactory.createClient(999999)).toThrow(
          "No RPC URL available for chain 999999",
        );
      });
    });

    describe("getFirstAvailableUrl", () => {
      it("returns first available URL for supported chain", () => {
        const url = EvmClientFactory.getFirstAvailableUrl(11155111);
        expect(url).toContain("alchemy.com");
      });

      it("returns undefined for unsupported chain", () => {
        const url = EvmClientFactory.getFirstAvailableUrl(999999);
        expect(url).toBeUndefined();
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

      expect(
        vi.mocked(UnifiedRpcClientFactory.createViemTransport),
      ).toHaveBeenCalledWith(11155111, expect.stringContaining("alchemy.com"));
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
