import { createPublicClient, fallback, http, Client, PublicClient } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  celo,
  filecoinCalibration,
  optimism,
  sepolia,
} from "viem/chains";
import {
  alchemyApiKey,
  drpcApiPkey,
  environment,
  Environment,
  filecoinApiKey,
  infuraApiKey,
} from "@/utils/constants.js";

interface RpcProvider {
  getUrl(chainId: number): string | undefined;
}

class AlchemyProvider implements RpcProvider {
  getUrl(chainId: number): string | undefined {
    const urls: Record<number, string> = {
      10: `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      8453: `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      42161: `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      421614: `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      84532: `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      11155111: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
    };
    return urls[chainId];
  }
}

class InfuraProvider implements RpcProvider {
  getUrl(chainId: number): string | undefined {
    const urls: Record<number, string> = {
      10: `https://optimism-mainnet.infura.io/v3/${infuraApiKey}`,
      42220: `https://celo-mainnet.infura.io/v3/${infuraApiKey}`,
      42161: `https://arbitrum-mainnet.infura.io/v3/${infuraApiKey}`,
      421614: `https://arbitrum-sepolia.infura.io/v3/${infuraApiKey}`,
    };
    return urls[chainId];
  }
}

class DrpcProvider implements RpcProvider {
  getUrl(chainId: number): string | undefined {
    const networks: Record<number, string> = {
      10: "optimism",
      8453: "base",
      42220: "celo",
      42161: "arbitrum",
      421614: "arbitrum-sepolia",
    };
    const network = networks[chainId];
    return network
      ? `https://lb.drpc.org/ogrpc?network=${network}&dkey=${drpcApiPkey}`
      : undefined;
  }
}

class GlifProvider implements RpcProvider {
  getUrl(chainId: number): string | undefined {
    return chainId === 314159
      ? `https://calibration.node.glif.io/archive/lotus/rpc/v1`
      : undefined;
  }
}

// Factory for Chain Configuration
class ChainFactory {
  static getChain(chainId: number) {
    const chains: Record<number, any> = {
      10: optimism,
      8453: base,
      42220: celo,
      42161: arbitrum,
      421614: arbitrumSepolia,
      84532: baseSepolia,
      11155111: sepolia,
      314159: filecoinCalibration,
    };

    const chain = chains[chainId];
    if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`);
    return chain;
  }

  static getSupportedChains(): number[] {
    return environment === Environment.TEST
      ? [11155111, 84532, 421614, 314159]
      : [10, 8453, 42220, 42161];
  }
}

// Client Factory using Provider Strategy
class EvmClientFactory {
  private static readonly providers: RpcProvider[] = [
    new AlchemyProvider(),
    new InfuraProvider(),
    new DrpcProvider(),
    new GlifProvider(),
  ];
  private static readonly RPC_TIMEOUT = 20_000;

  private static createTransport(chainId: number) {
    const transports = this.providers
      .map((provider) => provider.getUrl(chainId))
      .filter((url): url is string => !!url)
      .map((url) => {
        const options = { timeout: this.RPC_TIMEOUT };
        if (chainId === 314159) {
          return http(url, {
            ...options,
            fetchOptions: {
              headers: { Authorization: `Bearer ${filecoinApiKey}` },
            },
          });
        }
        return http(url, options);
      });

    return fallback(transports, { retryCount: 5 });
  }

  static createClient(chainId: number): PublicClient {
    // @ts-expect-error viem types are not correctly infered
    return createPublicClient({
      chain: ChainFactory.getChain(chainId),
      transport: EvmClientFactory.createTransport(chainId),
    });
  }
}

export const getRpcUrl = (chainId: number): string => {
  // Use existing provider classes to get URLs
  const providers = [
    new AlchemyProvider(),
    new InfuraProvider(),
    new DrpcProvider(),
    new GlifProvider(),
  ];

  // Return the first available URL
  const url = providers
    .map((provider) => provider.getUrl(chainId))
    .find((url) => url !== undefined);

  if (!url) throw new Error(`No RPC URL available for chain ${chainId}`);
  return url;
};

// Public API
export { EvmClientFactory };
export const getSupportedChains = ChainFactory.getSupportedChains;
export const getEvmClient = EvmClientFactory.createClient;
