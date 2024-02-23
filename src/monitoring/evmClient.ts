import { createPublicClient, http, PublicClient } from "viem";
import { sepolia } from "viem/chains";
import { alchemyApiKey, chainId } from "@/utils/constants";

const selectedNetwork = () => {
  switch (chainId) {
    case "11155111":
      return sepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const alchemyBaseUrl = () => {
  switch (chainId) {
    case "11155111":
      return "https://eth-sepolia.g.alchemy.com/v2/";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const client: PublicClient = createPublicClient({
  chain: selectedNetwork(),
  transport: http(`${alchemyBaseUrl()}${alchemyApiKey}`),
});
