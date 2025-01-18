import { vi } from "vitest";

vi.mock("viem", () => ({
  createPublicClient: vi.fn(),
  http: vi.fn((url, options) => ({ url, ...options })),
  fallback: vi.fn((transports) => transports),
}));

vi.mock("@/utils/constants", () => ({
  environment: "test",
  alchemyApiKey: "alchemy-key",
  infuraApiKey: "infura-key",
  drpcApiPkey: "drpc-key",
  filecoinApiKey: "filecoin-key",
  Environment: { TEST: "test", PROD: "prod" },
}));

import { describe, it, expect, beforeEach } from "vitest";
import {
  EvmClientFactory,
  getRpcUrl,
  getSupportedChains,
} from "../../src/clients/evmClient";
import { createPublicClient } from "viem";

describe("EvmClientFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createClient", () => {
    it("should create a client with correct configuration", () => {
      EvmClientFactory.createClient(11155111); // Sepolia testnet

      expect(createPublicClient).toHaveBeenCalledWith(
        expect.objectContaining({
          chain: expect.any(Object),
          transport: expect.any(Object),
        }),
      );
    });

    it("should throw error for unsupported chain", () => {
      expect(() => EvmClientFactory.createClient(999999)).toThrow(
        "Unsupported chain ID: 999999",
      );
    });
  });

  describe("getSupportedChains", () => {
    it("should return test chains in test environment", () => {
      const chains = getSupportedChains();
      expect(chains).toEqual([11155111, 84532, 421614, 314159]);
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

  describe("Transport Creation", () => {
    it("should create transport with auth for Filecoin", () => {
      const transport = EvmClientFactory["createTransport"](314159);

      console.log(transport[0]);
      expect(transport[0]).toMatchObject({
        url: "https://calibration.node.glif.io/archive/lotus/rpc/v1",
        fetchOptions: {
          headers: {
            Authorization: expect.stringContaining("filecoin-key"),
          },
        },
      });
    });

    it("should create standard transport for other chains", () => {
      const transport = EvmClientFactory["createTransport"](11155111);
      expect(transport[0]).not.toHaveProperty(
        "fetchOptions.headers.Authorization",
      );
    });

    it("should create fallback transport with multiple providers", () => {
      const transport = EvmClientFactory["createTransport"](42161); // Arbitrum
      expect(transport).toHaveLength(3); // Arbitrum has Alchemy, Infura, and DRPC
    });
  });

  describe("RPC Providers", () => {
    it("should include all providers for Arbitrum", () => {
      const transports = EvmClientFactory["createTransport"](42161);

      // Check that we have URLs from all providers
      const urls = transports.map((t: any) => t.url);
      expect(urls).toEqual(
        expect.arrayContaining([
          expect.stringContaining("alchemy.com"),
          expect.stringContaining("infura.io"),
          expect.stringContaining("drpc.org"),
        ]),
      );
    });

    it("should return first available URL for getRpcUrl", () => {
      const url = getRpcUrl(42161); // Arbitrum
      expect(url).toMatch(/^https:\/\/.+/); // Just verify it's a valid URL
    });
  });
});
