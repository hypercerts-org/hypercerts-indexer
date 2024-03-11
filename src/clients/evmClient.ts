import { createPublicClient, http, PublicClient } from "viem";
import { sepolia } from "viem/chains";
import { alchemyApiKey, chainId } from "@/utils/constants";

const selectedNetwork = () => {
  switch (chainId) {
    case 11155111:
      return sepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const alchemyUrl = (apiKey: string) => {
  switch (chainId) {
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

/* Returns a PublicClient instance for the configured network. */
export const client: PublicClient = createPublicClient({
  chain: selectedNetwork(),
  transport: http(alchemyUrl(alchemyApiKey)),
});
