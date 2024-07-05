import chainsauce from "@/indexer/chainsauce.js";

class Indexer {
  running = false;
  indexer;

  constructor() {
    this.indexer = chainsauce;
  }

  async start() {
    this.toggleRunning(true);

    this.indexer.watch();
  }

  toggleRunning(running: boolean) {
    this.running = running;
  }

  async stop() {
    await this.indexer.stop();
  }
}

export default Indexer;
