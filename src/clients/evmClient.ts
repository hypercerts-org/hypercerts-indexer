import { createPublicClient, http } from "viem";
import { baseSepolia, optimism, sepolia } from "viem/chains";
import { alchemyApiKey, chainId } from "@/utils/constants";

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
      return `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`;
    case 84532:
      return `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

/* Returns a PublicClient instance for the configured network. */
export const client = createPublicClient({
  cacheTime: 10_000,
  chain: selectedNetwork(),
  transport: http(alchemyUrl()),
  batch: {
    multicall: {
      wait: 32,
    },
  },
});
