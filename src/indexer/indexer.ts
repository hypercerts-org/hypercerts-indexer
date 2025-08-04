import { getIndexer } from "@/indexer/chainsauce.js";
import RequestQueue from "@/indexer/requestQueue.js";
import { getSupportedChains } from "@/clients/evmClient.js";
import { sepolia } from "viem/chains";

class Indexer {
  running = false;

  constructor() {}

  async start() {
    this.toggleRunning(true);

    const supportedChains = getSupportedChains();

    console.log(supportedChains);

    if (!supportedChains || supportedChains.length === 0) {
      throw new Error("No supported chains found.");
    }

    const requestQueue = new RequestQueue();

    const chainsToIndex = supportedChains
      .filter((chainId) => chainId === sepolia.id)
      .map((chainId) => getIndexer({ chainId, requestQueue }));

    await Promise.all(chainsToIndex);
  }

  toggleRunning(running: boolean) {
    this.running = running;
  }
}

export default Indexer;
