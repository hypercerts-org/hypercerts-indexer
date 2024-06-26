import {
  createTestClient,
  createPublicClient,
  http,
  createWalletClient,
} from "viem";
import { sepolia } from "viem/chains";
//@ts-ignore
import { anvil } from "prool/instances";
import { alchemyApiKey } from "../../src/utils/constants";
import { definePool } from "prool";

/**
 * The id of the current test worker.
 *
 * This is used by the anvil proxy to route requests to the correct anvil instance.
 */

const anvilConfig = anvil({
  chainId: 11155111,
  forkChainId: 11155111,
  forkUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
  forkBlockNumber: 4421945n,
  autoImpersonate: true,
});

export const pool = definePool({
  instance: anvilConfig,
});
// @ts-expect-error type references less important for tests
export const anvilInstance = await pool.start(1);

const transport = http(`http://localhost:${anvilInstance.port}`);

export const testClient = createTestClient({
  chain: sepolia,
  mode: "anvil",
  transport,
});

export const publicClient = createPublicClient({
  chain: sepolia,
  transport,
});

export const walletClient = createWalletClient({
  chain: sepolia,
  transport,
});
