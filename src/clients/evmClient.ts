import { createPublicClient, fallback, http } from "viem";
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
  infuraApiKey,
} from "@/utils/constants.js";

export const getSupportedChains = () => {
  if (environment === Environment.TEST)
    return [11155111, 84532, 421614, 314159];
  if (environment === Environment.PRODUCTION) return [10, 8453, 42220, 42161];
};

const selectedNetwork = (chainId: number) => {
  switch (chainId) {
    case 10:
      return optimism;
    case 8453:
      return base;
    case 42220:
      return celo;
    case 42161:
      return arbitrum;
    case 421614:
      return arbitrumSepolia;
    case 84532:
      return baseSepolia;
    case 11155111:
      return sepolia;
    case 314159:
      return filecoinCalibration;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const alchemyUrl = (chainId: number) => {
  switch (chainId) {
    case 10:
      return `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
    case 8453:
      return `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
    case 42220:
      return;
    case 42161:
      return `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
    case 421614:
      return `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    case 84532:
      return `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    case 11155111:
      return `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;
    case 314159:
      return;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const infuraUrl = (chainId: number) => {
  switch (chainId) {
    case 10:
      return `https://optimism-mainnet.infura.io/v3/${infuraApiKey}`;
    case 8453:
      return;
    case 42220:
      return `https://celo-mainnet.infura.io/v3/${infuraApiKey}`;
    case 42161:
      return `https://arbitrum-mainnet.infura.io/v3/${infuraApiKey}`;
    case 421614:
      return `https://arbitrum-sepolia.infura.io/v3/${infuraApiKey}`;
    case 84532:
      return;
    case 11155111:
      return;
    case 314159:
      return;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const drpcUrl = (chainId: number) => {
  switch (chainId) {
    case 10:
      return `https://lb.drpc.org/ogrpc?network=optimism&dkey=${drpcApiPkey}`;
    case 8453:
      return `https://lb.drpc.org/ogrpc?network=base&dkey=${drpcApiPkey}`;
    case 42220:
      return `https://lb.drpc.org/ogrpc?network=celo&dkey=${drpcApiPkey}`;
    case 42161:
      return `https://lb.drpc.org/ogrpc?network=arbitrum&dkey=${drpcApiPkey}`;
    case 421614:
      return `https://lb.drpc.org/ogrpc?network=arbitrum-sepolia&dkey=${drpcApiPkey}`;
    case 84532:
      return;
    case 11155111:
      return;
    case 314159:
      return;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

const glifUrl = (chainId: number) => {
  switch (chainId) {
    case 314159:
      return `https://api.calibration.node.glif.io/rpc/v1`;
    default:
      return;
  }
};

const rpc_timeout = 20_000;

export const getRpcUrl = (chainId: number) => {
  const alchemy = alchemyUrl(chainId);
  const infura = infuraUrl(chainId);
  const drpc = drpcUrl(chainId);
  const glif = glifUrl(chainId);
  return [alchemy, infura, drpc, glif].filter((url) => url)[0];
};

const fallBackProvider = (chainId: number) => {
  const alchemy = alchemyUrl(chainId)
    ? [http(alchemyUrl(chainId), { timeout: rpc_timeout })]
    : [];
  const infura = infuraUrl(chainId)
    ? [http(infuraUrl(chainId), { timeout: rpc_timeout })]
    : [];
  const drpc = drpcUrl(chainId)
    ? [http(drpcUrl(chainId), { timeout: rpc_timeout })]
    : [];
  const glif = glifUrl(chainId)
    ? [http(glifUrl(chainId), { timeout: rpc_timeout })]
    : [];
  return fallback([...alchemy, ...drpc, ...infura, ...glif], {
    retryCount: 5,
  });
};

/* Returns a PublicClient instance for the configured network. */
// @ts-expect-error viem typings
export const getEvmClient = (chainId: number) =>
  createPublicClient({
    chain: selectedNetwork(chainId),
    transport: fallBackProvider(chainId),
  });
