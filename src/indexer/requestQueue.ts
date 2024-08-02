import { dbClient } from "../clients/dbClient.js";
import { CompiledQuery } from "kysely";
import fs from "fs";

export default class RequestQueue {
  private requestsCache: CompiledQuery<unknown>[][] = [];
  private running = false;

  constructor() {
    this.startWorker();
  }

  addRequests({ requests }: { requests: CompiledQuery<unknown>[] }) {
    this.requestsCache.push(requests);
  }

  private async startWorker() {
    this.running = true;
    while (this.running) {
      await this.processQueue();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the interval as needed
    }
  }

  private async processQueue() {
    while (this.requestsCache.length > 0) {
      const requests = this.requestsCache.shift();
      if (!requests || requests.length === 0) continue;

      try {
        await dbClient.transaction().execute(async (trx) => {
          for (const request of requests) {
            await trx.executeQuery(request);
          }
        });
      } catch (error) {
        console.error("Failed to submit request", error);
      }
    }
  }

  private logErrorToFile(
    error: unknown,
    request: CompiledQuery<unknown> | undefined,
  ) {
    const errorMessage = `Error: ${error}\nRequest: ${JSON.stringify(request)}\n\n`;
    fs.appendFile("error_log.txt", errorMessage, (err) => {
      if (err) {
        console.error("Failed to write error to file", err);
      }
    });
  }

  stopWorker() {
    this.running = false;
  }
}
