import { createPublicClient, fallback, http } from "viem";
import { baseSepolia, optimism, sepolia } from "viem/chains";
import {
  alchemyApiKey,
  ankrApiKey,
  chainId,
  infuraApiKey,
} from "@/utils/constants.js";

const selectedNetwork = () => {
  switch (chainId) {
    case 10:
      return optimism;
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
    case 84532:
      return;
    case 11155111:
      return `https://sepolia.infura.io/v3/${infuraApiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const ankrUrl = () => {
  switch (chainId) {
    case 10:
      return `https://rpc.ankr.com/optimism/${ankrApiKey}`;
    case 84532:
      return `https://rpc.ankr.com/base_sepolia/${ankrApiKey}`;
    case 11155111:
      return `https://rpc.ankr.com/eth_sepolia/${ankrApiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const fallBackProvider = () => {
  const alchemy = alchemyUrl() ? [http(alchemyUrl())] : [];
  const ankr = ankrUrl() ? [http(ankrUrl())] : [];
  const infura = infuraUrl() ? [http(infuraUrl())] : [];
  return fallback([...infura, ...alchemy, ...ankr], {
    rank: true,
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
