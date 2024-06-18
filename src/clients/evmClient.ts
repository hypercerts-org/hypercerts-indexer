import { createPublicClient, fallback, http } from "viem";
import { base, baseSepolia, celo, optimism, sepolia } from "viem/chains";
import {
  alchemyApiKey,
  chainId,
  drpcApiPkey,
  infuraApiKey,
} from "@/utils/constants.js";

const selectedNetwork = () => {
  switch (chainId) {
    case 10:
      return optimism;
    case 8453:
      return base;
    case 42220:
      return celo;
    case 84532:
      return baseSepolia;
    case 11155111:
      return sepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const alchemyUrl = () => {
  switch (chainId) {
    case 10:
      return `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
    case 8453:
      return `https://base-mainnet.g.alchemy.com/v2/{alchemyApiKey}`;
    case 42220:
      return;
    case 84532:
      return `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const infuraUrl = () => {
  switch (chainId) {
    case 10:
      return `https://optimism-mainnet.infura.io/v3/${infuraApiKey}`;
    case 8453:
      return;
    case 42220:
      return `https://celo-mainnet.infura.io/v3/${infuraApiKey}`;
    case 84532:
      return;
    case 11155111:
      return `https://sepolia.infura.io/v3/${infuraApiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const drpcUrl = () => {
  switch (chainId) {
    case 10:
      return `https://lb.drpc.org/ogrpc?network=optimism&dkey=${drpcApiPkey}`;
    case 8453:
      return `https://lb.drpc.org/ogrpc?network=base&dkey=${drpcApiPkey}`;
    case 42220:
      return `https://lb.drpc.org/ogrpc?network=celo&dkey=${drpcApiPkey}`;
    case 84532:
      return;
    case 11155111:
      return;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const fallBackProvider = () => {
  const alchemy = alchemyUrl() ? [http(alchemyUrl())] : [];
  const infura = infuraUrl() ? [http(infuraUrl())] : [];
  const drpc = drpcUrl() ? [http(drpcUrl())] : [];
  return fallback([...alchemy, ...drpc, ...infura], {
    retryDelay: 1500,
  });
};

/* Returns a PublicClient instance for the configured network. */
// @ts-expect-error viem typings
export const client = createPublicClient({
  cacheTime: 10_000,
  chain: selectedNetwork(),
  transport: fallBackProvider(),
  batch: {
    multicall: {
      wait: 32,
    },
  },
});
