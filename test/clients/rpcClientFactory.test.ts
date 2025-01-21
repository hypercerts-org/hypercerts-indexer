import { createHttpRpcClient } from "@hypercerts-org/chainsauce";
import { createPublicClient, http } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createRpcClient,
    UnifiedRpcClientFactory,
} from "../../src/clients/rpcClientFactory.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("@/clients/chainFactory", () => ({
  ChainFactory: {
    getChain: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

vi.mock("@hypercerts-org/chainsauce", () => ({
  createHttpRpcClient: vi.fn(),
}));

vi.mock("viem", () => ({
  http: vi.fn().mockReturnValue({
    request: vi.fn(),
    retryCount: 3,
    timeout: 20_000,
    config: { request: vi.fn() },
    value: { request: vi.fn() },
    transport: () => ({ request: vi.fn() }),
  }),
  createPublicClient: vi.fn(),
}));

vi.mock("@/utils/constants", () => ({
  filecoinApiKey: "mock-filecoin-key",
}));

describe("UnifiedRpcClientFactory", () => {
  const testUrl = "https://test.rpc.url";
  const testChainId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createChainsauceClient", () => {
    it("creates basic client without headers", () => {
      UnifiedRpcClientFactory.createChainsauceClient(testChainId, testUrl);

      expect(createHttpRpcClient).toHaveBeenCalledWith({
        url: testUrl,
      });
    });

    it("creates client with headers for Filecoin chains", () => {
      UnifiedRpcClientFactory.createChainsauceClient(314, testUrl);

      const clientConfig = vi.mocked(createHttpRpcClient).mock.calls[0][0];
      expect(clientConfig.url).toBe(testUrl);
      expect(clientConfig.fetch).toBeDefined();

      // Test the custom fetch function
      clientConfig.fetch!(testUrl, {});

      expect(mockFetch).toHaveBeenCalledWith(testUrl, {
        headers: {
          Authorization: "Bearer mock-filecoin-key",
        },
      });
    });
  });

  describe("createViemTransport", () => {
    it("creates basic transport without headers", () => {
      UnifiedRpcClientFactory.createViemTransport(testChainId, testUrl);

      expect(http).toHaveBeenCalledWith(testUrl, {
        timeout: 20_000,
      });
    });

    it("creates transport with headers for Filecoin chains", () => {
      UnifiedRpcClientFactory.createViemTransport(314, testUrl);

      expect(http).toHaveBeenCalledWith(testUrl, {
        timeout: 20_000,
        fetchOptions: {
          headers: {
            Authorization: "Bearer mock-filecoin-key",
          },
        },
      });
    });
  });

  describe("createViemClient", () => {
    it("creates client with correct configuration", () => {
      UnifiedRpcClientFactory.createViemClient(testChainId, testUrl);

      // Teste if the mocked properties are passed to the createPublicClient function
      expect(createPublicClient).toHaveBeenCalledWith({
        chain: { id: 1 },
        transport: {
          config: { request: expect.any(Function) },
          request: expect.any(Function),
          retryCount: 3,
          timeout: 20000,
          transport: expect.any(Function),
          value: { request: expect.any(Function) },
        },
      });
    });
  });

  describe("createRpcClient", () => {
    it("creates Chainsauce client when specified", () => {
      createRpcClient(testChainId, testUrl, "chainsauce");

      expect(createHttpRpcClient).toHaveBeenCalled();
    });

    it("creates Viem client by default", () => {
      createRpcClient(testChainId, testUrl);

      expect(createPublicClient).toHaveBeenCalled();
    });
  });
});
