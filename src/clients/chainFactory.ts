import { environment, Environment } from "@/utils/constants.js";
import { Chain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  celo,
  filecoin,
  filecoinCalibration,
  optimism,
  sepolia,
} from "viem/chains";

export class ChainFactory {
  static getChain(chainId: number): Chain {
    const chains: Record<number, Chain> = {
      10: optimism,
      314: filecoin,
      8453: base,
      42161: arbitrum,
      42220: celo,
      84532: baseSepolia,
      314159: filecoinCalibration,
      421614: arbitrumSepolia,
      11155111: sepolia,
    };

    const chain = chains[chainId];
    if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`);
    return chain;
  }

  static getSupportedChains(): number[] {
    return environment === Environment.TEST
      ? [84532, 314159, 421614, 11155111]
      : [10, 8453, 42220, 42161, 314];
  }
}
