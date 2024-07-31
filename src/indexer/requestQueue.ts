import { dbClient } from "../clients/dbClient.js";
import { CompiledQuery } from "kysely";

export default class RequestQueue {
  private requestsCache: CompiledQuery<unknown>[] = [];

  constructor() {}

  addRequests({ requests }: { requests: CompiledQuery<unknown>[] }) {
    this.requestsCache.push(...requests);
  }

  // Submits the queue
  async submitQueue() {
    if (this.requestsCache.length === 0) return;

    // Example submission logic, replace with actual database submission
    try {
      await dbClient.transaction().execute(async (trx) => {
        for (const request of this.requestsCache) {
          await trx.executeQuery(request);
        }
      });
    } catch (error) {
      console.error("Failed to submit request queue", error);
    }

    // Clear the queue after submission
    this.requestsCache = [];
  }
}
