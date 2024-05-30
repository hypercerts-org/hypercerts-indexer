import { createPublicClient, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { alchemyApiKey, chainId } from "@/utils/constants";

const selectedNetwork = () => {
  switch (chainId) {
    case 84532:
      return baseSepolia;
    case 11155111:
      return sepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const alchemyUrl = (apiKey: string) => {
  switch (chainId) {
    case 84532:
      return `https://base-sepolia.g.alchemy.com/v2/${apiKey}`;
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

/* Returns a PublicClient instance for the configured network. */
export const client = createPublicClient({
  cacheTime: 10_000,
  chain: selectedNetwork(),
  transport: http(alchemyUrl(alchemyApiKey)),
  batch: {
    multicall: {
      wait: 32,
    },
  },
});
