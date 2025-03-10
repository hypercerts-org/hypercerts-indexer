import { filecoinApiKey } from "@/utils/constants.js";
import { createHttpRpcClient } from "@hypercerts-org/chainsauce";
import { createPublicClient, http, PublicClient, Transport } from "viem";
import { ChainFactory } from "./chainFactory.js";

interface RpcConfig {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// Chain-specific RPC configuration factory
class RpcConfigFactory {
  private static readonly DEFAULT_TIMEOUT = 20_000;

  static getConfig(chainId: number, url: string): RpcConfig {
    const baseConfig: RpcConfig = {
      url,
      timeout: this.DEFAULT_TIMEOUT,
    };

    // Chain-specific configurations
    switch (chainId) {
      case 314:
      case 314159:
        return {
          ...baseConfig,
          headers: {
            Authorization: `Bearer ${filecoinApiKey}`,
          },
        };
      default:
        return baseConfig;
    }
  }
}

// Unified client factory for both Viem and Chainsauce clients
export class UnifiedRpcClientFactory {
  // Creates a Chainsauce HTTP RPC client
  static createChainsauceClient(chainId: number, url: string) {
    const config = RpcConfigFactory.getConfig(chainId, url);

    if (config.headers) {
      const customFetch = (url: string | URL | Request, init?: RequestInit) => {
        return fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            ...config.headers,
          },
        });
      };

      return createHttpRpcClient({
        url: config.url,
        fetch: customFetch,
        retryDelayMs: 1000,
      });
    }

    return createHttpRpcClient({ url: config.url });
  }

  // Creates a Viem transport
  static createViemTransport(chainId: number, url: string): Transport {
    const config = RpcConfigFactory.getConfig(chainId, url);

    const httpConfig: any = {
      timeout: config.timeout,
    };

    if (config.headers) {
      httpConfig.fetchOptions = {
        headers: config.headers,
      };
    }

    return http(config.url, httpConfig);
  }

  // Creates a Viem public client
  static createViemClient(chainId: number, url: string): PublicClient {
    return createPublicClient({
      chain: ChainFactory.getChain(chainId),
      transport: this.createViemTransport(chainId, url),
    });
  }
}

// Helper function to create appropriate client based on context
export const createRpcClient = (
  chainId: number,
  url: string,
  clientType: "chainsauce" | "viem" = "viem",
) => {
  return clientType === "chainsauce"
    ? UnifiedRpcClientFactory.createChainsauceClient(chainId, url)
    : UnifiedRpcClientFactory.createViemClient(chainId, url);
};
