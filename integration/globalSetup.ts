import { startProxy } from "@viem/anvil";
import { alchemyApiKey } from "../src/utils/constants";

export default async function () {
  return await startProxy({
    port: 8545, // By default, the proxy will listen on port 8545.
    host: "::", // By default, the proxy will listen on all interfaces.
    options: {
      chainId: 11155111,
      forkUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      forkBlockNumber: 4421945n,
    },
  });
}
