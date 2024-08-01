import { getIndexer } from "@/indexer/chainsauce.js";
import RequestQueue from "@/indexer/requestQueue.js";
import { getSupportedChains } from "@/clients/evmClient.js";

class Indexer {
  running = false;

  constructor() {}

  async start() {
    this.toggleRunning(true);

    const supportedChains = getSupportedChains();

    if (!supportedChains || supportedChains.length === 0) {
      throw new Error("No supported chains found.");
    }

    const requestQueue = new RequestQueue();

    const chainsToIndex = supportedChains.map((chainId) =>
      getIndexer({ chainId, requestQueue }),
    );

    await Promise.all(chainsToIndex);
  }

  toggleRunning(running: boolean) {
    this.running = running;
  }
}

export default Indexer;
